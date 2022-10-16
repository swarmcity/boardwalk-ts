import { useEffect, useState } from 'react'

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
