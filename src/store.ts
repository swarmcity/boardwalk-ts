import createStore from 'teaful'

// Lib
import { readLocalStore, updateLocalStore } from './lib/store'

// Types
import type { Profile } from './types/profile'

type Store = {
	profile: Partial<Profile> | undefined
}

export const { useStore, getStore, withStore } = createStore<Store>(
	{
		profile: readLocalStore('profile'),
	},
	({ store, prevStore }) => {
		updateLocalStore(store, prevStore, 'profile')
	}
)
