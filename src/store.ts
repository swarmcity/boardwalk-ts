import createStore from 'teaful'

// Lib
import { readLocalStore, updateLocalStore } from './lib/store'

// Types
import type { Profile } from './types/profile'

type Store = {
	profile: Partial<Profile> | undefined
}

export const { useStore, getStore, withStore, setStore } = createStore<Store>(
	{
		profile: readLocalStore('profile', undefined, (key, value) => {
			if (key === 'lastUpdate' || key === 'lastSync') {
				return new Date(value)
			}
			return value
		}),
	},
	({ store, prevStore }) => {
		updateLocalStore(store, prevStore, 'profile')
	}
)
