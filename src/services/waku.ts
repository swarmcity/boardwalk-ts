import { useEffect, useState } from 'react'
import { PageDirection, Protocols } from 'js-waku'
import { FilterCallback, FilterSubscriptionOpts } from 'js-waku/lib/waku_filter'
import {
	DecoderV0,
	EncoderV0,
	MessageV0,
} from 'js-waku/lib/waku_message/version_0'

// Types
import type { Decoder, Message, WakuLight } from 'js-waku/lib/interfaces'
import type { DependencyList } from 'react'
import type { QueryOptions } from 'js-waku/lib/waku_store'
import type { Signer } from 'ethers'

// Hooks
import { useWaku } from '../hooks/use-waku'

// Custom types
export type WithPayload<Msg extends Message> = Msg & {
	get payload(): Uint8Array
}

export const wrapFilterCallback = <Msg extends Message>(
	callback: (message: Promise<Msg | undefined>) => Promise<unknown>
) => {
	return (message: Msg) => {
		callback(Promise.resolve(message))
	}
}

export const useWakuFilter = <Msg extends Message>(
	decoders: Decoder<Msg>[],
	_callback: FilterCallback<Msg>,
	dependencies: DependencyList,
	options: FilterSubscriptionOpts = {},
	enable = true
) => {
	const { waku, waiting } = useWaku([Protocols.Store])
	const [error, setError] = useState<string>()

	useEffect(() => {
		if (!waku || waiting || !enable) {
			return
		}

		let cancelled = false

		// Early abort if the effect was replaced
		const callback = (message: Msg) => {
			if (!cancelled) {
				_callback?.(message)
			}
		}

		const unsubscribe = waku.filter
			.subscribe(decoders, callback, options)
			.catch((error) => !cancelled && setError(error))

		return () => {
			cancelled = true
			unsubscribe.then((fn) => fn && fn())
		}
	}, [waiting, enable, ...dependencies])

	return { waiting, error }
}

// eslint-disable max-params
export const useWakuStore = <Msg extends Message, Callback>(
	fn: (
		waku: WakuLight
	) => (
		decoders: Decoder<Msg>[],
		callback: (message: Callback) => Promise<void | boolean> | boolean | void,
		options?: QueryOptions
	) => Promise<void>,
	decoders: Decoder<Msg>[],
	_callback: (message: Callback) => Promise<void | boolean> | boolean | void,
	dependencies: DependencyList,
	options: QueryOptions = {},
	disable = false
) => {
	const { waku, waiting } = useWaku([Protocols.Store])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string>()

	useEffect(() => {
		if (!waku || waiting || disable) {
			return
		}

		let cancelled = false
		setLoading(true)

		// Early abort if the effect was replaced
		const callback = (message: Callback) => {
			return cancelled ? true : _callback?.(message)
		}

		fn(waku)(decoders, callback, options)
			.catch((error) => !cancelled && setError(error))
			.finally(() => !cancelled && setLoading(false))

		return () => {
			cancelled = true
		}
	}, [waiting, disable, ...dependencies])

	return { waiting, loading, error }
}

export const useWakuStoreQuery = <Msg extends Message>(
	decoders: Decoder<Msg>[],
	callback: (
		message: Promise<Msg | undefined>
	) => Promise<void | boolean> | boolean | void,
	dependencies: DependencyList,
	options: QueryOptions = {},
	disable = false
) => {
	return useWakuStore<Msg, Promise<Msg | undefined>>(
		(waku: WakuLight) => waku.store.queryCallbackOnPromise.bind(waku.store),
		decoders,
		callback,
		dependencies,
		options,
		disable
	)
}

export const useWakuStoreQueryOrdered = <Msg extends Message>(
	decoders: Decoder<Msg>[],
	callback: (message: Msg) => Promise<void | boolean> | boolean | void,
	dependencies: DependencyList,
	options: QueryOptions = {},
	disable = false
) => {
	return useWakuStore<Msg, Msg>(
		(waku: WakuLight) => waku.store.queryOrderedCallback.bind(waku.store),
		decoders,
		callback,
		dependencies,
		options,
		disable
	)
}

export const postWakuMessage = async (
	waku: WakuLight,
	topic: string,
	payload: Uint8Array
) => {
	// Post the metadata on Waku
	const message = { payload }

	// Send the message
	await waku.lightPush.push(new EncoderV0(topic), { payload })

	// Return message
	return message
}

export const wrapSigner = (signer: Signer) => ({
	getSigner: async () => signer,
})

export const useLatestTopicData = <Data>(
	topic: string,
	decodeMessage: (message: WithPayload<MessageV0>) => Data | false,
	watch = false
) => {
	const [lastUpdate, setLastUpdate] = useState(Date.now())
	const [data, setData] = useState<Data>()
	const [payload, setPayload] = useState<Uint8Array>()

	const callback = async (msg: Promise<MessageV0 | undefined>) => {
		const message = await msg
		if (!message) {
			return
		}

		const data = decodeMessage(message as WithPayload<MessageV0>)
		if (data) {
			setData(data)
			setPayload(message.payload)
			setLastUpdate(Date.now())
			return true
		}
	}

	const decoders = [new DecoderV0(topic)]
	const state = useWakuStoreQuery(decoders, callback, [topic], {
		pageDirection: PageDirection.BACKWARD,
		pageSize: 1,
	})
	useWakuFilter(decoders, wrapFilterCallback(callback), [topic], {}, watch)

	return { ...state, lastUpdate, data, payload }
}

export const fetchLatestTopicData = <Msg extends Message>(
	waku: WakuLight,
	decoders: Decoder<Msg>[],
	callback: <Done extends boolean>(
		message: Done extends true ? Promise<undefined> : Promise<Msg | undefined>,
		done?: Done
	) => Promise<boolean | void>,
	options?: QueryOptions | undefined,
	watch = false
) => {
	// eslint-disable-next-line @typescript-eslint/no-extra-semi
	;(async () => {
		const generator = waku.store.queryGenerator(decoders, {
			pageDirection: PageDirection.BACKWARD,
			pageSize: 1,
		})

		for await (const messages of generator) {
			for (const message of messages) {
				if (await callback(message)) {
					return
				}
			}
		}

		callback(Promise.resolve(undefined), true)
	})()

	const unsubscribe =
		watch &&
		waku.filter.subscribe(decoders, wrapFilterCallback(callback), options)

	return { unsubscribe }
}
