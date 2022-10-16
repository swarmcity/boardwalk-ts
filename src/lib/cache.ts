import { useEffect, useState } from 'react'

// Types
import type { DependencyList } from 'react'

export const useCache = <Key, Value>(
	CACHE: Map<Key, Promise<Value> | undefined>,
	key: Key,
	fn: () => Promise<Value> | undefined,
	deps: DependencyList = []
) => {
	const [value, setValue] = useState<Value>()

	useEffect(() => {
		const cache = CACHE.get(key)
		if (cache) {
			cache.then(setValue)
			return
		}

		const call = fn()
		if (!call) {
			return
		}

		CACHE.set(key, call)
		call.then(setValue)
	}, deps)

	return value
}
