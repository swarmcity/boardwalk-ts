import { useEffect, useState } from 'react'
import { waitForRemotePeer, WakuMessage } from 'js-waku'
import { Wallet } from 'ethers'

// Types
import type { Waku } from 'js-waku'
import type { DependencyList } from 'react'
import type { QueryOptions } from 'js-waku/lib/waku_store'
import type { Signer } from 'ethers'

// Hooks
import { useWaku } from '../hooks/use-waku'

// Custom types
export type WakuMessageWithPayload = WakuMessage & { get payload(): Uint8Array }

export const useWakuStoreQuery = (
	callback: QueryOptions['callback'],
	getTopic: () => string,
	dependencies: DependencyList,
	options: Omit<QueryOptions, 'callback'> = {}
) => {
	const { waku, waiting } = useWaku()
	const [loading, setLoading] = useState(false)

	useEffect(() => {
		if (!waku || waiting) {
			return
		}

		waku.store
			.queryHistory([getTopic()], { callback, ...options })
			.then(() => setLoading(false))
	}, [waiting, ...dependencies])

	return { waiting, loading }
}

export const postWakuMessage = async (
	waku: Waku,
	connector: { getSigner: () => Promise<Signer> },
	getTopic: (address: string) => string,
	payload: Uint8Array
) => {
	const promise = waitForRemotePeer(waku)

	// Get signer
	const signer = await connector.getSigner()
	const address = await signer.getAddress()

	if (!(signer instanceof Wallet)) {
		throw new Error('not implemented yet')
	}

	// Wait for peers
	// TODO: Should probably be moved somewhere else so the UI can access the state
	await promise

	// Post the metadata on Waku
	const message = await WakuMessage.fromBytes(payload, getTopic(address))

	// Send the message
	await waku.relay.send(message)
}
