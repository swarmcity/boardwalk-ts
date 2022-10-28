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

// Lib
import { readLocalStore, updateLocalStore } from '../lib/store'

// Services
import { useWakuStoreQuery, WithPayload } from './waku'
import * as ecdh from './ecdh'
import * as ecdsa from './ecdsa'

// Types
import type { WakuLight } from 'js-waku/lib/interfaces'

// Protos
import { ChatMessage as ChatMessageProto } from '../protos/chat-message'
import { KeyExchange } from '../protos/key-exchange'

// Config
const PREFIX = 'chat'

// Types
type TheirChatKeys = {
	theirSigPubKey: JsonWebKey
	theirECDHPubKey: JsonWebKey
}

type ChatKeys = Partial<TheirChatKeys> & {
	mySigPubKey: JsonWebKey
	mySigPrivKey: JsonWebKey
	myECDHPubKey: JsonWebKey
	myECDHPrivKey: JsonWebKey

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

type KeyPairs = {
	ecdhKeys: CryptoKeyPair
	ecdsaKeys: CryptoKeyPair
}

// Store
const store = createStore<ChatStore>(
	{
		keys: readLocalStore('keys', PREFIX) ?? {},
	},
	({ store, prevStore }) => {
		updateLocalStore(store, prevStore, 'keys', PREFIX)
	}
)

export const { useStore, getStore, withStore, setStore } = store

export const getRecordKey = (marketplace: string, item: bigint) => {
	return `${marketplace}:${item}`
}

const fetchChatKeys = (marketplace: string, item: bigint) => {
	const [key] = getStore.keys[getRecordKey(marketplace, item)]()
	return key
}

const formatChatKeys = async (
	chatKeys: ChatKeys
): Promise<FormattedChatKeys | undefined> => {
	if (!chatKeys || !chatKeys.theirSigPubKey || !chatKeys.theirECDHPubKey) {
		return
	}

	const privKey = await ecdh.importKey(chatKeys.myECDHPrivKey)
	const pubKey = await ecdh.importKey(chatKeys.theirECDHPubKey)
	const symKey = await ecdh.deriveKey(privKey, pubKey)

	return {
		symKey: await ecdh.exportRawKey(symKey),
		mySigPubKey: await ecdsa.jsonToRaw(chatKeys.mySigPubKey),
		theirSigPubKey: await ecdsa.jsonToRaw(chatKeys.theirSigPubKey),
		mySigPrivKey: fromString(chatKeys.mySigPrivKey?.d ?? '', 'base64url'),
	}
}

const getChatKeys = async (marketplace: string, item: bigint) => {
	const [chatKeys] = getStore.keys[getRecordKey(marketplace, item)]()
	return formatChatKeys(chatKeys)
}

const useChatKeys = (marketplace: string, item: bigint) => {
	const [chatKeys] = useStore.keys[getRecordKey(marketplace, item)]()
	return useAsync(async () => formatChatKeys(chatKeys), [chatKeys])
}

export const generateKeys = async (): Promise<KeyPairs> => {
	const ecdhKeys = await ecdh.generateKey()
	const ecdsaKeys = await ecdsa.generateKey()
	return { ecdhKeys, ecdsaKeys }
}

export const setChatKey = async (
	marketplace: string,
	item: bigint,
	type: Exclude<keyof ChatKeys, 'temp'>,
	key: JsonWebKey
) => {
	setStore.keys[getRecordKey(marketplace, item)][type]?.(key)
}

export const setChatKeys = async (
	marketplace: string,
	item: bigint,
	{ ecdhKeys, ecdsaKeys }: KeyPairs
) => {
	setStore.keys[getRecordKey(marketplace, item)]({
		myECDHPrivKey: await crypto.subtle.exportKey('jwk', ecdhKeys.privateKey),
		myECDHPubKey: await crypto.subtle.exportKey('jwk', ecdhKeys.publicKey),
		mySigPrivKey: await crypto.subtle.exportKey('jwk', ecdsaKeys.privateKey),
		mySigPubKey: await crypto.subtle.exportKey('jwk', ecdsaKeys.publicKey),
	})
}

export const setTheirChatKeys = async (
	marketplace: string,
	item: bigint,
	keyExchange: KeyExchange
) => {
	const theirECDHPubKey = await ecdh.rawToJson(keyExchange.ecdhPubKey)
	const theirSigPubKey = await ecdsa.rawToJson(keyExchange.sigPubKey)

	setStore.keys[getRecordKey(marketplace, item)]((keys) => ({
		...keys,
		theirECDHPubKey,
		theirSigPubKey,
	}))
}

export const setTheirTempChatKeys = async (
	marketplace: string,
	item: bigint,
	address: string,
	keyExchange: KeyExchange
) => {
	const theirECDHPubKey = await ecdh.rawToJson(keyExchange.ecdhPubKey)
	const theirSigPubKey = await ecdsa.rawToJson(keyExchange.sigPubKey)

	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-expect-error
	setStore.keys[getRecordKey(marketplace, item)].temp((temp) => ({
		...temp,
		[address]: { theirECDHPubKey, theirSigPubKey },
	}))
}

// TODO: Clean this up (maybe only store private keys, maybe only
// store Uint8Array and get rid of `crypto.subtle` altogether?
export const generateChatKeys = async (
	marketplace: string,
	item: bigint
): Promise<KeyPairs> => {
	const current = fetchChatKeys(marketplace, item)
	if (current?.myECDHPrivKey || current?.mySigPrivKey) {
		return {
			ecdhKeys: {
				publicKey: await ecdh.importKey(current.myECDHPubKey),
				privateKey: await ecdh.importKey(current.myECDHPrivKey),
			},
			ecdsaKeys: {
				publicKey: await ecdsa.importKey(current.mySigPubKey),
				privateKey: await ecdsa.importKey(current.mySigPrivKey),
			},
		}
	}

	const keys = await generateKeys()
	await setChatKeys(marketplace, item, keys)
	return keys
}

export const getKeyExchange = async ({ ecdhKeys, ecdsaKeys }: KeyPairs) => {
	const exportKey = crypto.subtle.exportKey.bind(crypto.subtle, 'raw')
	return {
		sigPubKey: new Uint8Array(await exportKey(ecdsaKeys.publicKey)),
		ecdhPubKey: new Uint8Array(await exportKey(ecdhKeys.publicKey)),
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
