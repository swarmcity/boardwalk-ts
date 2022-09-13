import { useEffect, useState } from 'react'
import { WakuMessage, PageDirection, Protocols } from 'js-waku'

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
	_callback: QueryOptions['callback'],
	getTopic: () => string,
	dependencies: DependencyList,
	options: Omit<QueryOptions, 'callback'> = {}
) => {
	const { waku, waiting } = useWaku([Protocols.Store])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string>()

	useEffect(() => {
		if (!waku || waiting) {
			return
		}

		let cancelled = false
		setLoading(true)

		// Early abort if the effect was replaced
		const callback = (messages: WakuMessage[]) => {
			return cancelled ? true : _callback?.(messages)
		}

		waku.store
			.queryHistory([getTopic()], { callback, ...options })
			.catch((error) => !cancelled && setError(error))
			.finally(() => !cancelled && setLoading(false))

		return () => {
			cancelled = true
		}
	}, [waiting, ...dependencies])

	return { waiting, loading, error }
}

export const postWakuMessage = async (
	waku: Waku,
	topic: string,
	payload: Uint8Array
) => {
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
