import { useState } from 'react'
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
} from './waku'
import { createSignedProto, decodeSignedPayload, EIP712Config } from './eip-712'

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
		Profile,
		signer
	)

	return postWakuMessage(waku, connector, getProfileTopic, payload)
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

export const useProfile = (waku: Waku | undefined, address: string) => {
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
		waku,
		callback,
		() => getProfileTopic(address),
		[address],
		{ pageDirection: PageDirection.BACKWARD }
	)

	return { ...state, lastUpdate, profile }
}
