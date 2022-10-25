import { useEffect, useState } from 'react'
import { useAsync } from 'react-use'
import createStore from 'teaful'
import {
	MessageV1,
	SymDecoder,
	SymEncoder,
} from 'js-waku/lib/waku_message/version_1'

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

// Config
const PREFIX = 'chat'

// Types
type ChatKeys = {
	symKey?: JsonWebKey

	theirSigPubKey?: JsonWebKey
	theirECDHPubKey?: JsonWebKey

	mySigPubKey: JsonWebKey
	mySigPrivKey: JsonWebKey
	myECDHPrivKey: JsonWebKey
}

type ChatStore = {
	keys: Record<string, ChatKeys>
}

type ChatMessage = {
	message: string
}

type FormattedChatKeys = {
	symKey: Uint8Array
	mySigPubKey: Uint8Array
	theirSigPubKey: Uint8Array
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
	if (!chatKeys.theirSigPubKey || !chatKeys.theirECDHPubKey) {
		return
	}

	const privKey = await ecdh.importKey(chatKeys.myECDHPrivKey)
	const pubKey = await ecdh.importKey(chatKeys.theirECDHPubKey)
	const symKey = await ecdh.deriveKey(privKey, pubKey)

	return {
		symKey: await ecdh.exportRawKey(symKey),
		mySigPubKey: await ecdsa.jsonToRaw(chatKeys.mySigPubKey),
		theirSigPubKey: await ecdsa.jsonToRaw(chatKeys.theirSigPubKey),
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

export const generateChatKeys = async (marketplace: string, item: bigint) => {
	const current = fetchChatKeys(marketplace, item)
	if (current.myECDHPrivKey || current.mySigPrivKey) {
		throw new Error('keys already exist for this item in this marketplace')
	}

	const ecdhKeys = await ecdh.generateKey()
	const ecdsaKeys = await ecdsa.generateKey()

	setStore.keys[getRecordKey(marketplace, item)]({
		myECDHPrivKey: await crypto.subtle.exportKey('jwk', ecdhKeys.privateKey),
		mySigPrivKey: await crypto.subtle.exportKey('jwk', ecdsaKeys.privateKey),
		mySigPubKey: await crypto.subtle.exportKey('jwk', ecdsaKeys.publicKey),
	})

	return { ecdhKeys, ecdsaKeys }
}

export const setChatKey = async (
	marketplace: string,
	item: bigint,
	type: keyof ChatKeys,
	key: JsonWebKey
) => {
	setStore.keys[getRecordKey(marketplace, item)][type]?.(key)
}

export const getChatMessageTopic = (marketplace: string, item: bigint) => {
	return `/swarmcity/1/chat-message-${marketplace}-${item}/proto`
}

const decodeWakuMessage = async (
	message: WithPayload<MessageV1>
): Promise<ChatMessage> => {
	return ChatMessageProto.decode(message.payload)
}

export const useChatMessages = (marketplace: string, item: bigint) => {
	const [items, setItems] = useState<ChatMessage[]>([])
	const [lastUpdate, setLastUpdate] = useState(Date.now())

	const callback = async (msg: Promise<MessageV1 | undefined>) => {
		const message = await msg
		if (!message?.payload) {
			return
		}

		const decoded = await decodeWakuMessage(message as WithPayload<MessageV1>)
		if (!decoded) {
			return
		}

		setItems((items) => [...items, decoded])
		setLastUpdate(Date.now())
	}

	const { value: keys } = useChatKeys(marketplace, item)
	const topic = getChatMessageTopic(marketplace, item)
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

export const createChatMessage = async (
	waku: WakuLight,
	marketplace: string,
	item: bigint,
	message: ChatMessage
) => {
	const keys = await getChatKeys(marketplace, item)
	if (!keys) {
		throw new Error('no symmetric key found')
	}

	// Create the protobuf message
	const payload = ChatMessageProto.encode(message)

	// Post the message on Waku
	await waku.lightPush.push(
		new SymEncoder(getChatMessageTopic(marketplace, item), keys.symKey),
		new MessageV1({}, payload, undefined /* TODO */, keys.mySigPubKey)
	)
}