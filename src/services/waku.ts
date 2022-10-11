import { useEffect, useState } from 'react'
import { PageDirection, Protocols } from 'js-waku'
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

export const useWakuStoreQuery = <Msg extends Message>(
	decoders: Decoder<Msg>[],
	_callback: (
		message: Promise<Msg | undefined>
	) => Promise<void | boolean> | boolean | void,
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
		const callback = (message: Promise<Msg | undefined>) => {
			return cancelled ? true : _callback?.(message)
		}

		waku.store
			.queryCallbackOnPromise(decoders, callback, options)
			.catch((error) => !cancelled && setError(error))
			.finally(() => !cancelled && setLoading(false))

		return () => {
			cancelled = true
		}
	}, [waiting, ...dependencies])

	return { waiting, loading, error }
}

export const useWakuStoreQueryOrdered = <Msg extends Message>(
	decoders: Decoder<Msg>[],
	_callback: (message: Msg) => Promise<void | boolean> | boolean | void,
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
		const callback = (message: Msg) => {
			return cancelled ? true : _callback?.(message)
		}

		waku.store
			.queryOrderedCallback(decoders, callback, options)
			.catch((error) => !cancelled && setError(error))
			.finally(() => !cancelled && setLoading(false))

		return () => {
			cancelled = true
		}
	}, [waiting, ...dependencies])

	return { waiting, loading, error }
}

export const postWakuMessage = async (
	waku: WakuLight,
	topic: string,
	payload: Uint8Array
) => {
	// Post the metadata on Waku
	const message = new MessageV0({ payload })

	// Send the message
	await waku.lightPush.push(new EncoderV0(topic), new MessageV0({ payload }))

	// Return message
	return message
}

export const wrapSigner = (signer: Signer) => ({
	getSigner: async () => signer,
})

export const useLatestTopicData = <Data>(
	topic: string,
	decodeMessage: (message: WithPayload<MessageV0>) => Data | false
) => {
	const [lastUpdate, setLastUpdate] = useState(Date.now())
	const [data, setData] = useState<Data>()
	const [payload, setPayload] = useState<Uint8Array>()

	const callback = (message: MessageV0) => {
		const data = decodeMessage(message as WithPayload<MessageV0>)
		if (data) {
			setData(data)
			setPayload(message.payload)
			setLastUpdate(Date.now())
			return true
		}
	}

	const state = useWakuStoreQueryOrdered(
		[new DecoderV0(topic)],
		callback,
		[topic],
		{
			pageDirection: PageDirection.BACKWARD,
			pageSize: 1,
		}
	)

	return { ...state, lastUpdate, data, payload }
}
