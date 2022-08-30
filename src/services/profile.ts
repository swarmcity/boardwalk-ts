import { useEffect } from 'react'
import { useAccount } from 'wagmi'

// Store
import { setStore, useStore } from '../store'

// Types
import { Protocols, Waku } from 'js-waku'
import type { Signer } from 'ethers'
import type { Profile } from '../types/profile'

// Protos
import { Profile as ProfileProto } from '../protos/Profile'

// Services
import {
	postWakuMessage,
	useLatestTopicData,
	WakuMessageWithPayload,
} from './waku'
import { createSignedProto, decodeSignedPayload, EIP712Config } from './eip-712'
import { createProfilePicture } from './profile-picture'

// Hooks
import { useWaku } from '../hooks/use-waku'

type CreateProfile = {
	username: string
	pictureHash?: Uint8Array
	date: string
}

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

export const getProfileTopic = (address: string) => {
	return `/swarmcity/1/profile-${address}/proto`
}

export const createProfile = async (
	waku: Waku,
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

const decodeMessage = (
	message: WakuMessageWithPayload
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

export const useProfile = (address: string) => {
	const { data, ...state } = useLatestTopicData(
		getProfileTopic(address),
		decodeMessage
	)
	return { ...state, profile: data }
}

const postPicture = async (waku: Waku, dataUri?: string) => {
	if (!dataUri) {
		return
	}

	const { hash } = await createProfilePicture(waku, { dataUri })
	return new Uint8Array(hash)
}

// TODO: Fix teaful issues
const updateProfile = async (
	waku: Waku,
	connector: { getSigner: () => Promise<Signer> },
	profile: Profile
) => {
	const pictureHash = await postPicture(waku, profile.avatar)

	await createProfile(waku, connector, {
		username: profile.username,
		date: profile.lastUpdate.toISOString(),
		pictureHash,
	})

	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-expect-error
	setStore.profile.lastSync(new Date())
}

export const useSyncProfile = () => {
	const { waku, waiting } = useWaku([Protocols.Relay])
	const { address, connector } = useAccount()
	const [profile] = useStore.profile()
	const {
		loading,
		profile: wakuProfile,
		payload,
	} = useProfile(profile?.address ?? '')

	useEffect(() => {
		if (!waku || !connector || !profile || !address || waiting || loading) {
			return
		}

		if (address !== profile.address) {
			console.error(
				`Profile address (${profile.address}) differs from signer address (${address})`
			)
			return
		}

		const wakuDate = new Date(wakuProfile?.date ?? 0)
		const profileDate = new Date(profile?.lastUpdate ?? 0)

		// If remote is more recent
		if (wakuDate > profileDate) {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-expect-error
			setStore.profile.username(wakuProfile.username)

			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-expect-error
			setStore.profile.lastUpdate(new Date(wakuProfile.date))

			return
		}

		// If the local profile is more recent, store it
		if (profileDate > wakuDate) {
			// TODO: Remove cast after Partial is removed from Partial<Profile> in store
			updateProfile(waku, connector, profile as Profile)
			return
		}

		// If both profiles are in sync, only update the profile once a day
		if (
			payload &&
			Date.now() - (profile.lastSync?.getTime() ?? 0) > 24 * 60 * 60
		) {
			postWakuMessage(waku, getProfileTopic(address), payload).then(() => {
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-expect-error
				setStore.profile.lastSync(new Date())
			})
		}
	}, [waku, connector, waiting, profile?.lastUpdate, loading])
}
