function getKey(key: string, prefix = 'store') {
	return `${prefix}_${key}`
}

export function setLocalStore(key: string, value?: string) {
	if (value) {
		localStorage.setItem(key, value)
	} else {
		localStorage.removeItem(key)
	}
}

// TODO: Figure out types
export function updateLocalStore<
	Store extends Record<string, unknown>,
	Key extends keyof Store
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
>(store: Store, prevStore: Store, key: Key, prefix?: string, replacer?: any) {
	if (store[key] !== prevStore[key]) {
		setLocalStore(
			getKey(key as string, prefix),
			JSON.stringify(store[key], replacer)
		)
	}
}

export function readLocalStore<T, K extends keyof T>(
	key: string,
	prefix?: string,
	reviver?: T extends Record<string, unknown>
		? (key: keyof T, value: string) => T[K]
		: undefined
): T | undefined {
	try {
		const json = localStorage.getItem(getKey(key, prefix))
		return json && JSON.parse(json, reviver)
	} catch (err) {
		return undefined
	}
}
