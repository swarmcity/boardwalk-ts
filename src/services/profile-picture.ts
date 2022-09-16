import { useMemo } from 'react'

// Types
import type { WakuLight } from 'js-waku/lib/interfaces'

// Protos
import { ProfilePicture } from '../protos/profile-picture'

// Services
import {
	postWakuMessage,
	useLatestTopicData,
	WakuMessageWithPayload,
} from './waku'

// Lib
import { bufferToHex } from '../lib/tools'

// Assets
import avatarDefault from '../assets/imgs/avatar.svg?url'

type CreateProfilePicture = {
	dataUri: string
}

export const getProfilePictureTopic = (hash: string) => {
	return `/swarmcity/1/profile-picture-${hash}/proto`
}

export const createProfilePicture = async (
	waku: WakuLight,
	{ dataUri }: CreateProfilePicture
) => {
	const blob = await (await fetch(dataUri)).blob()
	const buffer = await blob.arrayBuffer()
	const hash = await crypto.subtle.digest('SHA-256', buffer)
	const message = postWakuMessage(
		waku,
		getProfilePictureTopic(bufferToHex(hash)),
		ProfilePicture.encode({
			data: new Uint8Array(buffer),
			type: blob.type,
		})
	)
	return { hash, message }
}

const decodeMessage = (
	message: WakuMessageWithPayload
): ProfilePicture | false => {
	try {
		return ProfilePicture.decode(message.payload)
	} catch (err) {
		return false
	}
}

export const useProfilePicture = (hash?: string) => {
	const { data, ...state } = useLatestTopicData(
		getProfilePictureTopic(hash ?? ''),
		decodeMessage
	)
	return { ...state, picture: data }
}

export const useProfilePictureURL = (hash?: string | Uint8Array) => {
	const { picture } = useProfilePicture(
		hash instanceof Uint8Array ? bufferToHex(hash) : hash
	)

	return useMemo(() => {
		if (!picture) {
			return avatarDefault
		}

		const blob = new Blob([picture.data], { type: picture?.type })
		return URL.createObjectURL(blob)
	}, [picture])
}
