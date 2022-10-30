import { useEffect, useState } from 'react'
import { useAsync } from 'react-use'
import createStore from 'teaful'
import {
	MessageV1,
	SymDecoder,
	SymEncoder,
} from 'js-waku/lib/waku_message/version_1'
import { fromString } from 'uint8arrays/from-string'
import { equals } from 'uint8arrays/equals'
import { getPublicKey } from 'js-waku'
import { bigintToBuf } from 'bigint-conversion'
import { getSharedSecret } from 'noble-secp256k1'
import { toString } from 'uint8arrays/to-string'

// Lib
import { readLocalStore, updateLocalStore } from '../lib/store'

// Services
import { useWakuStoreQuery, WithPayload } from './waku'

// Types
import type { WakuLight } from 'js-waku/lib/interfaces'

// Protos
import { ChatMessage as ChatMessageProto } from '../protos/chat-message'
import { KeyExchange } from '../protos/key-exchange'

// Store
import { getStore as getMainStore } from '../store'

// Config
const PREFIX = 'chat'
const KEY_TYPES = {
	ecdh: {
		size: 256,
		prefix: new Uint8Array(0),
	},
	ecdsa: {
		size: 256,
		prefix: new Uint8Array(1),
	},
}

// Types
type TheirChatKeys = {
	theirSigPubKey: Uint8Array
	theirECDHPubKey: Uint8Array
}

type ChatKeys = Partial<TheirChatKeys> & {
	temp?: Record<string, TheirChatKeys>
}

type ChatStore = {
	keys: Record<string, ChatKeys>
}

type ChatMessage = {
	date: Date
	from: string
	message: string
}

type FormattedChatKeys = {
	symKey: Uint8Array
	mySigPubKey: Uint8Array
	theirSigPubKey: Uint8Array
	mySigPrivKey: Uint8Array
}

// Store
const store = createStore<ChatStore>(
	{
		keys:
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			readLocalStore('keys', PREFIX, (key: any, value: any) => {
				if (key === 'theirSigPubKey' || key === 'theirECDHPubKey') {
					return fromString(value, 'base64url')
				}
				return value
			}) ?? {},
	},
	({ store, prevStore }) => {
		updateLocalStore(
			store,
			prevStore,
			'keys',
			PREFIX,
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(key: any, value: any) => {
				if (key === 'theirSigPubKey' || key === 'theirECDHPubKey') {
					return toString(value, 'base64url')
				}
				return value
			}
		)
	}
)

export const { useStore, getStore, withStore, setStore } = store

export const deriveChatPrivateKey = async (
	marketplace: string,
	item: bigint,
	type: keyof typeof KEY_TYPES
): Promise<Uint8Array> => {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-expect-error
	const [baseKey] = getMainStore.profile.chatBaseKey()
	const base = await crypto.subtle.importKey(
		'raw',
		baseKey,
		{ name: 'HKDF' },
		false,
		['deriveKey', 'deriveBits']
	)

	const address = marketplace.substring(2, Infinity).toLocaleLowerCase()
	const salt = new Uint8Array([
		...KEY_TYPES[type].prefix,
		...fromString(address, 'hex'),
		...new Uint8Array(bigintToBuf(item)),
	])

	return new Uint8Array(
		await crypto.subtle.deriveBits(
			{
				name: 'HKDF',
				hash: 'SHA-256',
				salt: salt,
				info: new Uint8Array(),
			},
			base,
			KEY_TYPES[type].size
		)
	)
}

export const getRecordKey = (marketplace: string, item: bigint) => {
	return `${marketplace}:${item}`
}

const formatChatKeys = async (
	marketplace: string,
	item: bigint,
	chatKeys: ChatKeys
): Promise<FormattedChatKeys | undefined> => {
	if (!chatKeys?.theirSigPubKey || !chatKeys?.theirECDHPubKey) {
		return
	}

	const ecdhPrivateKey = await deriveChatPrivateKey(marketplace, item, 'ecdh')
	const ecdsaPrivateKey = await deriveChatPrivateKey(marketplace, item, 'ecdsa')
	const symKey = await crypto.subtle.digest(
		'SHA-256',
		getSharedSecret(ecdhPrivateKey, chatKeys.theirECDHPubKey) as Uint8Array
	)

	return {
		symKey: new Uint8Array(symKey),
		mySigPubKey: getPublicKey(ecdsaPrivateKey),
		theirSigPubKey: chatKeys.theirSigPubKey,
		mySigPrivKey: ecdsaPrivateKey,
	}
}

const getChatKeys = async (marketplace: string, item: bigint) => {
	const [chatKeys] = getStore.keys[getRecordKey(marketplace, item)]()
	return formatChatKeys(marketplace, item, chatKeys)
}

const useChatKeys = (marketplace: string, item: bigint) => {
	const [chatKeys] = useStore.keys[getRecordKey(marketplace, item)]()
	return useAsync(
		async () => formatChatKeys(marketplace, item, chatKeys),
		[chatKeys]
	)
}

export const setChatKey = async (
	marketplace: string,
	item: bigint,
	type: Exclude<keyof ChatKeys, 'temp'>,
	key: Uint8Array
) => {
	setStore.keys[getRecordKey(marketplace, item)][type]?.(key)
}

export const setTheirChatKeys = async (
	marketplace: string,
	item: bigint,
	{ sigPubKey, ecdhPubKey }: KeyExchange
) => {
	setStore.keys[getRecordKey(marketplace, item)]((keys) => ({
		...keys,
		theirECDHPubKey: ecdhPubKey,
		theirSigPubKey: sigPubKey,
	}))
}

export const setTheirTempChatKeys = async (
	marketplace: string,
	item: bigint,
	address: string,
	keyExchange: KeyExchange
) => {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-expect-error
	setStore.keys[getRecordKey(marketplace, item)].temp((temp) => ({
		...temp,
		[address]: {
			theirECDHPubKey: keyExchange.ecdhPubKey,
			theirSigPubKey: keyExchange.sigPubKey,
		},
	}))
}

export const getKeyExchange = async (marketplace: string, item: bigint) => {
	const ecdhPrivateKey = await deriveChatPrivateKey(marketplace, item, 'ecdh')
	const ecdsaPrivateKey = await deriveChatPrivateKey(marketplace, item, 'ecdsa')

	return {
		sigPubKey: getPublicKey(ecdsaPrivateKey),
		ecdhPubKey: getPublicKey(ecdhPrivateKey),
	}
}

export const selectTempChatKey = (
	marketplace: string,
	item: bigint,
	address: string
) => {
	setStore.keys[getRecordKey(marketplace, item)]((keys) => {
		if (!keys) {
			return keys
		}

		if (keys.theirECDHPubKey && keys.theirSigPubKey) {
			return keys
		}

		const theirKeys = keys.temp?.[address]
		if (!theirKeys) {
			return keys
		}

		delete keys.temp
		return {
			...keys,
			...theirKeys,
		}
	})
}

export const getChatMessageTopic = (marketplace: string, item: bigint) => {
	return `/swarmcity/1/chat-message-${marketplace}-${item}/proto`
}

const decodeWakuMessage = async (
	message: WithPayload<MessageV1>
): Promise<ChatMessage> => {
	return {
		date: message.timestamp || new Date(),
		from: '',
		...ChatMessageProto.decode(message.payload),
	}
}

export const useChatMessages = (marketplace: string, item: bigint) => {
	const [items, setItems] = useState<ChatMessage[]>([])
	const [lastUpdate, setLastUpdate] = useState(Date.now())

	const { value: keys } = useChatKeys(marketplace, item)
	const topic = getChatMessageTopic(marketplace, item)

	console.log({ keys })

	const callback = async (msg: Promise<MessageV1 | undefined>) => {
		if (!keys) {
			return
		}

		const message = await msg
		if (!message?.payload || !message.signaturePublicKey) {
			return
		}

		const decoded = await decodeWakuMessage(message as WithPayload<MessageV1>)
		if (!decoded) {
			return
		}

		if (equals(message.signaturePublicKey, keys.mySigPubKey)) {
			decoded.from = 'me'
		} else if (equals(message.signaturePublicKey, keys.theirSigPubKey)) {
			decoded.from = 'them'
		} else {
			return
		}

		setItems((items) => [...items, decoded])
		setLastUpdate(Date.now())
	}

	const state = useWakuStoreQuery(
		keys?.symKey ? [new SymDecoder(topic, keys.symKey)] : [],
		callback,
		[topic],
		undefined,
		!keys
	)

	useEffect(() => (state.loading ? setItems([]) : undefined), [state.loading])

	return { ...state, lastUpdate, items }
}

export const postChatMessage = async (
	waku: WakuLight,
	marketplace: string,
	item: bigint,
	message: { message: string }
) => {
	const keys = await getChatKeys(marketplace, item)
	if (!keys) {
		throw new Error('no symmetric key found')
	}

	// Create the protobuf message
	const payload = ChatMessageProto.encode(message)

	// Post the message on Waku
	await waku.lightPush.push(
		new SymEncoder(
			getChatMessageTopic(marketplace, item),
			keys.symKey,
			keys.mySigPrivKey
		),
		{ payload }
	)
}
