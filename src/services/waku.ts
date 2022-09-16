import { useEffect, useState } from 'react'
import { WakuMessage, PageDirection, Protocols } from 'js-waku'

// Types
import type { WakuLight } from 'js-waku/lib/interfaces'
import type { DependencyList } from 'react'
import type { QueryOptions } from 'js-waku/lib/waku_store'
import type { Signer } from 'ethers'

// Hooks
import { useWaku } from '../hooks/use-waku'

// Custom types
export type WakuMessageWithPayload = WakuMessage & { get payload(): Uint8Array }

export const useWakuStore = <
	Message,
	Fn extends (
		contentTopics: string[],
		callback: (message: Message) => Promise<void | boolean> | boolean | void,
		options?: QueryOptions
	) => Promise<unknown>
>(
	fn: (waku: WakuLight) => Fn,
	_callback: (message: Message) => Promise<void | boolean> | boolean | void,
	getTopic: () => string,
	dependencies: DependencyList,
	options: QueryOptions = {}
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
		const callback = (message: Message) => {
			return cancelled ? true : _callback?.(message)
		}

		fn(waku)([getTopic()], callback, options)
			.catch((error) => !cancelled && setError(error))
			.finally(() => !cancelled && setLoading(false))

		return () => {
			cancelled = true
		}
	}, [waiting, ...dependencies])

	return { waiting, loading, error }
}

export const useWakuStoreQuery = (
	callback: (
		message: Promise<WakuMessage | undefined>
	) => Promise<void | boolean> | boolean | void,
	getTopic: () => string,
	dependencies: DependencyList,
	options: QueryOptions = {}
) => {
	return useWakuStore(
		(waku: WakuLight) => waku.store.queryCallbackOnPromise.bind(waku.store),
		callback,
		getTopic,
		dependencies,
		options
	)
}

export const useWakuStoreQueryOrdered = (
	callback: (message: WakuMessage) => Promise<void | boolean> | boolean | void,
	getTopic: () => string,
	dependencies: DependencyList,
	options: QueryOptions = {}
) => {
	return useWakuStore(
		(waku: WakuLight) => waku.store.queryOrderedCallback.bind(waku.store),
		callback,
		getTopic,
		dependencies,
		options
	)
}

export const postWakuMessage = async (
	waku: WakuLight,
	topic: string,
	payload: Uint8Array
) => {
	// Post the metadata on Waku
	const message = await WakuMessage.fromBytes(payload, topic)

	// Send the message
	await waku.lightPush.push(message)

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

	const callback = (message: WakuMessage) => {
		const data = decodeMessage(message as WakuMessageWithPayload)
		if (data) {
			setData(data)
			setPayload(message.payload)
			setLastUpdate(Date.now())
			return true
		}
	}

	const state = useWakuStoreQueryOrdered(callback, () => topic, [topic], {
		pageDirection: PageDirection.BACKWARD,
		pageSize: 1,
	})

	return { ...state, lastUpdate, data, payload }
}
