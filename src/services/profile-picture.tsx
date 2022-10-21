import { createContext, ReactNode, useMemo } from 'react'
import { DecoderV0, MessageV0 } from 'js-waku/lib/waku_message/version_0'

// Types
import type { WakuLight } from 'js-waku/lib/interfaces'

// Protos
import { ProfilePicture } from '../protos/profile-picture'

// Services
import { fetchLatestTopicData, postWakuMessage, WithPayload } from './waku'

// Lib
import { bufferToHex } from '../lib/tools'
import {
	EventDrivenCacheInstance,
	newEventDrivenCache,
	useEventDrivenCache,
} from '../lib/cache'

// Assets
import avatarDefault from '../assets/imgs/avatar.svg?url'

// Hooks
import { useWaku } from '../hooks/use-waku'
import { Protocols } from 'js-waku'

type CreateProfilePicture = {
	dataUri: string
}

export const getProfilePictureTopic = (hash: string) => {
	return `/swarmcity/1/profile-picture-${hash}/proto`
}

const decodeMessage = (
	message: WithPayload<MessageV0>
): ProfilePicture | false => {
	try {
		return ProfilePicture.decode(message.payload)
	} catch (err) {
		return false
	}
}

// Cache
const createCache = (waku: WakuLight) =>
	newEventDrivenCache(
		(
			hash: string | undefined,
			callback: (data: {
				picture: ProfilePicture
				payload: Uint8Array
				url: string
			}) => void
		) => {
			if (!hash) {
				return () => null
			}

			const decoders = [new DecoderV0(getProfilePictureTopic(hash))]
			const { unsubscribe } = fetchLatestTopicData(
				waku,
				decoders,
				async (msg: Promise<MessageV0 | undefined>) => {
					const message = (await msg) as WithPayload<MessageV0>
					if (!message) {
						return
					}

					const picture = decodeMessage(message)
					if (picture) {
						const blob = new Blob([picture.data], { type: picture?.type })
						const url = URL.createObjectURL(blob)
						callback({ picture, payload: message.payload, url })
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

export const ProfilePictureCacheContext = createContext<{
	cache?: EventDrivenCacheInstance<
		string,
		{ picture: ProfilePicture; payload: Uint8Array; url: string }
	>
}>({})

export const ProfilePictureCacheProvider = ({
	children,
}: {
	children: ReactNode
}) => {
	const { waku } = useWaku([Protocols.Store, Protocols.Filter])
	const cache = useMemo(() => waku && createCache(waku), [waku])

	return (
		<ProfilePictureCacheContext.Provider value={{ cache }}>
			{children}
		</ProfilePictureCacheContext.Provider>
	)
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

export const useProfilePictureURL = (_hash?: string | Uint8Array) => {
	const hash = _hash instanceof Uint8Array ? bufferToHex(_hash) : _hash
	const state = useEventDrivenCache(ProfilePictureCacheContext, hash)
	const { url = avatarDefault } = state.data || {}
	return url
}
