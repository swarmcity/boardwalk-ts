import { useContext, useEffect, useState } from 'react'

// Types
import type { DependencyList } from 'react'

export const getCache = async <Key, Value>(
	CACHE: Map<Key, Promise<Value> | undefined>,
	key: Key,
	fn: () => Promise<Value> | undefined
): Promise<Value | undefined> => {
	const cache = CACHE.get(key)
	if (cache) {
		return cache
	}

	const call = fn()
	if (!call) {
		return
	}

	CACHE.set(key, call)
	return call
}

export const useCache = <Key, Value>(
	CACHE: Map<Key, Promise<Value> | undefined>,
	key: Key,
	fn: () => Promise<Value> | undefined,
	deps: DependencyList = []
) => {
	const [value, setValue] = useState<Value>()

	useEffect(() => {
		getCache(CACHE, key, fn).then(setValue)
	}, deps)

	return value
}

export type EventDrivenCacheInstance<Key, Data> = {
	subscribe: (key: Key, listener: (data: Data) => void) => () => void
	unsubscribe: (key: Key, listener: ((data: Data) => void) | null) => void
}

export type CacheContext<Key, Data> = {
	cache?: EventDrivenCacheInstance<Key, Data> | undefined
	ready?: boolean
}

export const newEventDrivenCache = <Key extends string | number | symbol, Data>(
	fn: (
		key: Key | undefined,
		callback: (data: Data) => void,
		hasCache: boolean
	) => (() => void) | undefined
): EventDrivenCacheInstance<Key, Data> => {
	const cache: Partial<Record<Key, Data>> = {}
	const listeners: Partial<Record<Key, Array<(data: Data) => void>>> = {}
	const subscriptions: Partial<Record<Key, () => void>> = {}

	const unsubscribe = (key: Key, listener: ((data: Data) => void) | null) => {
		const list = listeners[key]
		if (!list) {
			return
		}

		// Remove the listener from the array
		const cleaned = []
		for (let i = 0; i < list.length ?? 0; i++) {
			if (list[i] === listener) {
				listener = null
			} else {
				cleaned.push(list[i])
			}
		}
		listeners[key] = cleaned

		// Clean the subscription when there are no listeners left
		if (!cleaned.length) {
			subscriptions[key]?.()
			delete subscriptions[key]
		}
	}

	const addListener = (key: Key, listener: (data: Data) => void) => {
		if (!listeners[key]) {
			listeners[key] = []
		}
		listeners[key]?.push(listener)
	}

	const callback = (key: Key) => (data: Data) => {
		// Set cache
		cache[key] = data

		// Fetch list of listeners to call
		const list = listeners[key]
		if (!list) {
			return
		}

		// Call all the listeners
		for (let i = 0; i < list.length || 0; i++) {
			list[i](data)
		}
	}

	const subscribe = (key: Key) => {
		// Only subscribe if no listeners currently exist
		if (subscriptions[key]) {
			return
		}

		// Call the function
		subscriptions[key] = fn(key, callback(key), !!cache[key])
	}

	return {
		subscribe: (key: Key, listener: (data: Data) => void) => {
			addListener(key, listener)
			subscribe(key)

			const cached = cache[key]
			if (cached) {
				// TODO: Figure out why the cast is necessary
				listener(cached as Data)
			}

			return () => {
				unsubscribe(key, listener)
			}
		},
		unsubscribe,
	}
}

export const useEventDrivenCache = <Key, Data>(
	context: React.Context<CacheContext<Key, Data>>,
	key?: Key
) => {
	const { cache, ready } = useContext(context)
	const [data, setData] = useState<Data>()
	const [lastUpdate, setLastUpdate] = useState(Date.now())

	useEffect(() => {
		if (!cache || !key || !ready) {
			return
		}

		return cache.subscribe(key, (data: Data) => {
			setData(data)
			setLastUpdate(Date.now())
		})
	}, [cache, key, ready])

	return { lastUpdate, data }
}
