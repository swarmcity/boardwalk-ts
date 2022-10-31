import { createContext, ReactNode, useEffect, useMemo } from 'react'
import { useAccount } from 'wagmi'
import { getAddress } from '@ethersproject/address'
import { DecoderV0, MessageV0 } from 'js-waku/lib/waku_message/version_0'
import { WakuLight } from 'js-waku/lib/interfaces'

// Store
import { setStore, useStore } from '../store'

// Types
import { Protocols } from 'js-waku'
import type { Signer } from 'ethers'
import type { Profile } from '../types'

// Protos
import { Profile as ProfileProto } from '../protos/profile'

// Services
import { fetchLatestTopicData, postWakuMessage, WithPayload } from './waku'
import { createSignedProto, decodeSignedPayload, EIP712Config } from './eip-712'
import { createProfilePicture, useProfilePicture } from './profile-picture'

// Hooks
import { useWaku } from '../hooks/use-waku'

// Lib
import {
	CacheContext,
	newEventDrivenCache,
	useEventDrivenCache,
} from '../lib/cache'
import { blobToDataURL } from '../lib/canvas'

type CreateProfile = {
	username: string
	pictureHash: Uint8Array
	date: string
}

// Cache
let SYNCED = false

// EIP-712
const eip712Config: EIP712Config = {
	domain: {
		name: 'Swarm.City',
		version: '1',
		salt: '0xe3dd854eb9d23c94680b3ec632b9072842365d9a702ab0df7da8bc398ee52c7d', // keccak256('profile')
	},
	types: {
		Profile: [
			{ name: 'address', type: 'address' },
			{ name: 'username', type: 'string' },
			{ name: 'pictureHash', type: 'bytes' },
			{ name: 'date', type: 'string' },
		],
	},
}

export const getProfileTopic = (address?: string) => {
	return address ? `/swarmcity/1/profile-${getAddress(address)}/proto` : ''
}

const decodeMessage = (
	message: WithPayload<MessageV0>
): ProfileProto | false => {
	return decodeSignedPayload(
		eip712Config,
		{
			formatValue: (profile, address) => ({ ...profile, address }),
			getSigner: (profile) => profile.address,
		},
		ProfileProto,
		message.payload
	)
}

// Cache
const createCache = (waku: WakuLight) =>
	newEventDrivenCache(
		(
			address: string | undefined,
			callback: (data: {
				profile?: ProfileProto
				message?: WithPayload<MessageV0>
				loading: boolean
			}) => void,
			hasCache: boolean
		) => {
			if (!address || hasCache) {
				return
			}

			const decoders = [new DecoderV0(getProfileTopic(address))]
			const { unsubscribe } = fetchLatestTopicData(
				waku,
				decoders,
				async (msg: Promise<MessageV0 | undefined>, done?: boolean) => {
					if (done) {
						callback({ loading: false })
					}

					const message = (await msg) as WithPayload<MessageV0>
					if (!message) {
						return
					}

					const profile = decodeMessage(message)
					if (profile) {
						callback({ profile, message, loading: false })
						return true
					}
				}
			)

			return () => {
				if (unsubscribe) {
					unsubscribe.then((fn) => fn())
				}
			}
		}
	)

export const ProfileCacheContext = createContext<
	CacheContext<
		string,
		{
			profile?: ProfileProto
			message?: WithPayload<MessageV0>
			loading: boolean
		}
	>
>({})

export const ProfileCacheProvider = ({ children }: { children: ReactNode }) => {
	const { waku, waiting } = useWaku([Protocols.Store, Protocols.Filter])
	const cache = useMemo(() => waku && createCache(waku), [waku])

	return (
		<ProfileCacheContext.Provider value={{ cache, ready: !waiting }}>
			{children}
		</ProfileCacheContext.Provider>
	)
}

export const createProfile = async (
	waku: WakuLight,
	connector: { getSigner: () => Promise<Signer> },
	input: CreateProfile
) => {
	const signer = await connector.getSigner()
	const topic = getProfileTopic(await signer.getAddress())
	const payload = await createSignedProto(
		eip712Config,
		(signer: Uint8Array) => ({ address: signer, ...input }),
		(signer: string) => ({ address: signer, ...input }),
		ProfileProto,
		signer
	)

	return postWakuMessage(waku, topic, payload)
}

export const useProfile = (address?: string) => {
	const { data, ...state } = useEventDrivenCache(ProfileCacheContext, address)
	return { ...state, ...data, loading: data?.loading ?? true }
}

const postPicture = async (waku: WakuLight, dataUri?: string) => {
	if (!dataUri) {
		return
	}

	const { hash } = await createProfilePicture(waku, { dataUri })
	return new Uint8Array(hash)
}

// TODO: Fix teaful issues
const updateProfile = async (
	waku: WakuLight,
	connector: { getSigner: () => Promise<Signer> },
	profile: Profile
) => {
	const pictureHash = profile.avatar
		? await postPicture(waku, profile.avatar)
		: undefined

	await createProfile(waku, connector, {
		username: profile.username,
		date: profile.lastUpdate.toISOString(),
		pictureHash: pictureHash ?? new Uint8Array(),
	})

	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-expect-error
	setStore.profile.lastSync(new Date())
}

export const useSyncProfile = () => {
	const { waku, waiting } = useWaku([Protocols.LightPush])
	const { address, connector } = useAccount()
	const [profile] = useStore.profile()
	const {
		profile: wakuProfile,
		message,
		loading,
	} = useProfile(profile?.address ?? '')
	const { data: profilePicture } = useProfilePicture(wakuProfile?.pictureHash)

	useEffect(() => {
		if (!waku || !connector || !profile || !address || waiting || loading) {
			return
		}

		// Do not run this again if we already did a sync action. This is a hack because
		// `useProfile` doesn't update automatically and thus constantly triggers the upload
		if (SYNCED) {
			return
		}

		if (address !== profile.address) {
			console.error(
				`Profile address (${profile.address}) differs from signer address (${address})`
			)
			return
		}

		// Assume some sync action is going to be carried out. This also avoids race conditions.
		SYNCED = true

		// Compare the dates
		const wakuDate = new Date(wakuProfile?.date ?? 0)
		const profileDate = new Date(profile?.lastUpdate ?? 0)

		// If remote is more recent
		if (wakuDate > profileDate && profilePicture) {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-expect-error
			setStore.profile.username(wakuProfile.username)

			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-expect-error
			setStore.profile.lastUpdate(new Date(wakuProfile.date))

			blobToDataURL(profilePicture.blob).then((avatar) => {
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-expect-error
				setStore.profile.avatar(avatar)
			})

			return
		}

		// If the local profile is more recent, store it
		else if (profileDate > wakuDate) {
			// TODO: Remove cast after Partial is removed from Partial<Profile> in store
			updateProfile(waku, connector, profile as Profile)
			return
		}

		// If both profiles are in sync, only update the profile once a day
		else if (
			message &&
			Date.now() - (profile.lastSync?.getTime() ?? 0) > 24 * 60 * 60 * 1000
		) {
			postWakuMessage(waku, getProfileTopic(address), message.payload).then(
				() => {
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-expect-error
					setStore.profile.lastSync(new Date())
				}
			)
		}

		// If no sync action happened, reset syncedRef
		else {
			SYNCED = false
		}
	}, [waku, connector, waiting, profile, loading, address, profilePicture])
}
