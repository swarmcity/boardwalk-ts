import createStore from 'teaful'

// Lib
import { readLocalStore, updateLocalStore } from './lib/store'

// Types
import type { Profile } from './types/profile'

type Store = {
	profile: Partial<Profile> | undefined
	lastProfileSync: Date
}

export const { useStore, getStore, withStore } = createStore<Store>(
	{
		profile: readLocalStore('profile'),
		lastProfileSync: new Date(readLocalStore('lastProfileSync') || 0),
	},
	({ store, prevStore }) => {
		updateLocalStore(store, prevStore, 'profile')
		updateLocalStore(store, prevStore, 'lastProfileSync')
	}
)
