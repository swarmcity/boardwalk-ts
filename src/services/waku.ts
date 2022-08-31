import { useEffect, useState } from 'react'
import {
	waitForRemotePeer,
	WakuMessage,
	PageDirection,
	Protocols,
} from 'js-waku'

// Types
import type { Waku } from 'js-waku'
import type { DependencyList } from 'react'
import type { QueryOptions } from 'js-waku/lib/waku_store'
import type { Signer } from 'ethers'

// Hooks
import { useWaku } from '../hooks/use-waku'

// Custom types
export type WakuMessageWithPayload = WakuMessage & { get payload(): Uint8Array }

export const useWakuStoreQuery = (
	callback: QueryOptions['callback'],
	getTopic: () => string,
	dependencies: DependencyList,
	options: Omit<QueryOptions, 'callback'> = {}
) => {
	const { waku, waiting } = useWaku([Protocols.Store])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		if (!waku || waiting) {
			return
		}

		waku.store
			.queryHistory([getTopic()], { callback, ...options })
			.then(() => setLoading(false))
	}, [waiting, ...dependencies])

	return { waiting, loading }
}

export const postWakuMessage = async (
	waku: Waku,
	topic: string,
	payload: Uint8Array
) => {
	const promise = waitForRemotePeer(waku)

	// Wait for peers
	// TODO: Should probably be moved somewhere else so the UI can access the state
	await promise

	// Post the metadata on Waku
	const message = await WakuMessage.fromBytes(payload, topic)

	// Send the message
	await waku.relay.send(message)

	// Return message
	return message
}

export const wrapSigner = (signer: Signer) => ({
	getSigner: async () => signer,
})

export const useLatestTopicData = <Data>(
	topic: string,
	decodeMessage: (message: WakuMessageWithPayload) => Data | false
) => {
	const [lastUpdate, setLastUpdate] = useState(Date.now())
	const [data, setData] = useState<Data>()
	const [payload, setPayload] = useState<Uint8Array>()

	const callback = (messages: WakuMessage[]) => {
		for (const message of messages) {
			const data = decodeMessage(message as WakuMessageWithPayload)
			if (data) {
				setData(data)
				setPayload(message.payload)
				setLastUpdate(Date.now())
				return true
			}
		}
	}

	const state = useWakuStoreQuery(callback, () => topic, [topic], {
		pageDirection: PageDirection.BACKWARD,
		pageSize: 1,
	})

	return { ...state, lastUpdate, data, payload }
}
