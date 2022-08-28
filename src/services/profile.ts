import { useEffect, useState } from 'react'
import { PageDirection, WakuMessage } from 'js-waku'

// Types
import type { Waku } from 'js-waku'
import type { Signer } from 'ethers'

// Protos
import { Profile } from '../protos/Profile'

// Services
import {
	postWakuMessage,
	useWakuStoreQuery,
	WakuMessageWithPayload,
	wrapSigner,
} from './waku'
import { createSignedProto, decodeSignedPayload, EIP712Config } from './eip-712'
import { useWaku } from '../hooks/use-waku'
import { useAccount } from 'wagmi'
import { useStore } from '../store'

type CreateProfile = {
	username: string
	pictureHash: Uint8Array
}

// EIP-712
const eip712Config: EIP712Config = {
	domain: {
		name: 'Swarm.City',
		version: '1',
		salt: '0xe3dd854eb9d23c94680b3ec632b9072842365d9a702ab0df7da8bc398ee52c7d', // keccak256('profile')
	},
	types: {
		Reply: [
			{ name: 'address', type: 'address' },
			{ name: 'username', type: 'string' },
			{ name: 'pictureHash', type: 'bytes' },
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
	const payload = await createSignedProto(
		eip712Config,
		(signer: Uint8Array) => ({ address: signer, ...input }),
		(signer: string) => ({ address: signer, ...input }),
		Profile,
		signer
	)

	return postWakuMessage(waku, wrapSigner(signer), getProfileTopic, payload)
}

const decodeMessage = (message: WakuMessageWithPayload): Profile | false => {
	return decodeSignedPayload(
		eip712Config,
		{
			formatValue: (profile, address) => ({ ...profile, address }),
			getSigner: (profile) => profile.address,
		},
		Profile,
		message.payload
	)
}

export const useProfile = (address: string) => {
	const [lastUpdate, setLastUpdate] = useState(Date.now())
	const [profile, setProfile] = useState<Profile>()

	const callback = (messages: WakuMessage[]) => {
		for (const message of messages) {
			const profile = decodeMessage(message as WakuMessageWithPayload)
			if (profile) {
				setProfile(profile)
				setLastUpdate(Date.now())
				return false
			}
		}
	}

	const state = useWakuStoreQuery(
		callback,
		() => getProfileTopic(address),
		[address],
		{ pageDirection: PageDirection.BACKWARD }
	)

	return { ...state, lastUpdate, profile }
}

export const useSyncProfile = () => {
	const { waku, waiting } = useWaku()
	const { address, connector } = useAccount()
	const [profile] = useStore.profile()
	const [lastProfileSync, setLastProfileSync] = useStore.lastProfileSync()

	useEffect(() => {
		if (!waku || !connector || !profile || waiting) {
			return
		}

		// Only update the profile once a day
		if (Date.now() - lastProfileSync.getTime() < 24 * 60 * 60) {
			return
		}

		if (address !== profile.address) {
			console.error(
				`Profile address (${profile.address}) differs from signer address (${address})`
			)
			return
		}

		// TODO: Remove cast after Partial is removed from Partial<Profile> in store
		createProfile(waku, connector, {
			username: profile.username as string,
			pictureHash: new Uint8Array([]),
		}).then(() => setLastProfileSync(new Date()))
	}, [waku, connector, waiting, profile])
}
