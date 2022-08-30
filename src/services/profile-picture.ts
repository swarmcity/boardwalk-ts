// Types
import type { Waku } from 'js-waku'

// Protos
import { ProfilePicture } from '../protos/ProfilePicture'

// Services
import {
	postWakuMessage,
	useLatestTopicData,
	WakuMessageWithPayload,
} from './waku'
import { bufferToHex } from '../lib/tools'

type CreateProfilePicture = {
	dataUri: string
}

export const getProfilePictureTopic = (hash: string) => {
	return `/swarmcity/1/profile-picture-${hash}/proto`
}

export const createProfilePicture = async (
	waku: Waku,
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

export const useProfilePicture = (hash: string) => {
	const { data, ...state } = useLatestTopicData(
		getProfilePictureTopic(hash),
		decodeMessage
	)
	return { ...state, picture: data }
}
