import createStore from 'teaful'

// Types
import type { Profile } from './types/profile'

type Store = {
	profile: Partial<Profile> | undefined
}

function setLocalStore(key: string, value?: string) {
	if (value) {
		localStorage.setItem(key, value)
	} else {
		localStorage.removeItem(key)
	}
}

function updateLocalStore(store: Store, prevStore: Store, key: keyof Store) {
	if (store[key] !== prevStore[key]) {
		setLocalStore(key, JSON.stringify(store[key]))
	}
}

function readLocalStore<T>(key: string): T | undefined {
	try {
		const json = localStorage.getItem(key)
		return json ? (JSON.parse(json) as T) : undefined
	} catch (err) {
		return undefined
	}
}

export const { useStore, getStore, withStore } = createStore<Store>(
	{
		profile: readLocalStore('profile'),
	},
	({ store, prevStore }) => {
		updateLocalStore(store, prevStore, 'profile')
	}
)
