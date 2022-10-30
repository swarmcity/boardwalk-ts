import createStore from 'teaful'
import { toString } from 'uint8arrays/to-string'
import { fromString } from 'uint8arrays/from-string'

// Lib
import { readLocalStore, updateLocalStore } from './lib/store'

// Types
import type { Profile } from './types'

type Store = {
	profile: Partial<Profile> | undefined
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const profileReplacer = <Key extends keyof Store['profile']>(
	key: keyof Key,
	value: Store['profile'][Key]
) => {
	if (key === 'chatBaseKey') {
		return toString(value, 'base64url')
	}
	return value
}

export const profileReviver = (key: keyof Profile, value: string) => {
	if (key === 'lastUpdate' || key === 'lastSync') {
		return new Date(value)
	}

	if (key === 'chatBaseKey') {
		return fromString(value, 'base64url')
	}

	return value
}

export const { useStore, getStore, withStore, setStore } = createStore<Store>(
	{
		profile: readLocalStore('profile', undefined, profileReviver),
	},
	({ store, prevStore }) => {
		updateLocalStore(store, prevStore, 'profile', undefined, profileReplacer)
	}
)
