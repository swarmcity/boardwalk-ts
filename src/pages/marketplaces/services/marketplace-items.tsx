import { useEffect, useMemo, useState } from 'react'
import { waitForRemotePeer, Waku, WakuMessage } from 'js-waku'
import { BigNumber, Contract, Event } from 'ethers'

// Types
import type { Signer } from 'ethers'

// Protos
import { ItemMetadata } from '../../../protos/ItemMetadata'

// ABIs
import marketplaceAbi from '../../../abis/marketplace.json'
import erc20Abi from '../../../abis/erc20.json'

// Tools
import { bufferToHex, numberToBigInt } from '../../../lib/tools'
import { useProvider } from 'wagmi'

type CreateItem = {
	price: number
	description: string
}

type WakuItem = {
	hash: string
	metadata: ItemMetadata
}

type ChainItem = {
	owner: string
	id: BigNumber
	metadata: string
	price: BigNumber
	fee: BigNumber
	seekerRep: BigNumber
	timestamp: number
}

type Item = Omit<ChainItem, 'metadata'> & { metadata: ItemMetadata }

type WakuMessageWithPayload = WakuMessage & { get payload(): Uint8Array }

export const getItemTopic = (address: string) => {
	return `/swarmcity/1/marketplace-items-${address}/proto`
}

export const createItem = async (
	waku: Waku,
	address: string,
	{ price, description }: CreateItem,
	connector: { getSigner: () => Promise<Signer> }
) => {
	const promise = waitForRemotePeer(waku)

	// Get signer
	const signer = await connector.getSigner()

	// Create the metadata
	const metadata = ItemMetadata.encode({ description })
	const hash = await crypto.subtle.digest('SHA-256', metadata)

	// Get the marketplace contract
	const contract = new Contract(address, marketplaceAbi, signer)

	// Get token decimals
	const tokenAddress = await contract.token()
	const token = new Contract(tokenAddress, erc20Abi, signer)
	const decimals = await token.decimals()

	// Wait for peers
	// TODO: Should probably be moved somewhere else so the UI can access the state
	await promise

	// Post the item on chain
	await contract.newItem(numberToBigInt(price, decimals), new Uint8Array(hash))

	// Post the metadata on Waku
	const message = await WakuMessage.fromBytes(metadata, getItemTopic(address))

	await waitForRemotePeer(waku)
	await waku.relay.send(message)
}

const decodeWakuMessage = async (
	message: WakuMessageWithPayload
): Promise<WakuItem> => {
	const hash = await crypto.subtle.digest('SHA-256', message.payload)
	return {
		hash: '0x' + bufferToHex(hash),
		metadata: ItemMetadata.decode(message.payload),
	}
}

const decodeWakuMessages = (messages: WakuMessage[]): Promise<WakuItem>[] => {
	return messages.flatMap((message) =>
		message.payload
			? [decodeWakuMessage(message as WakuMessageWithPayload)]
			: []
	)
}

export const useGetWakuItems = (waku: Waku | undefined, address: string) => {
	const [waiting, setWaiting] = useState(true)
	const [loading, setLoading] = useState(false)
	const [items, setItems] = useState<WakuItem[]>([])
	const [lastUpdate, setLastUpdate] = useState(Date.now())

	useEffect(() => {
		if (!waku) {
			return
		}

		waitForRemotePeer(waku).then(() => setWaiting(false))
	}, [waku])

	useEffect(() => {
		if (!waku || waiting) {
			return
		}

		setItems([])
		setLoading(true)
		const callback = (messages: WakuMessage[]) => {
			// eslint-disable-next-line @typescript-eslint/no-extra-semi
			;(async () => {
				const decoded = await Promise.all(decodeWakuMessages(messages))
				setItems([...items, ...decoded])
				setLastUpdate(Date.now())
			})()
		}

		waku.store
			.queryHistory([getItemTopic(address)], { callback })
			.then(() => setLoading(false))
	}, [waiting, address])

	return { waiting, loading, items, lastUpdate }
}

const decodeEvent = async (event: Event): Promise<ChainItem> => {
	if (!event.args) {
		throw new Error('no event args')
	}

	const { timestamp } = await event.getBlock()

	return {
		owner: event.args.owner,
		id: event.args.id,
		metadata: event.args.metadata,
		price: event.args.price,
		fee: event.args.fee,
		seekerRep: event.args.seekerRep,
		timestamp,
	}
}

export const useGetMarketplaceItems = (address: string) => {
	const [loading, setLoading] = useState(true)
	const [items, setItems] = useState<Record<string, ChainItem>>({})
	const [lastUpdate, setLastUpdate] = useState(Date.now())

	// Wagmi
	const provider = useProvider()
	const contract = useMemo(
		() => new Contract(address, marketplaceAbi, provider),
		[provider, address]
	)

	useEffect(() => {
		// eslint-disable-next-line @typescript-eslint/no-extra-semi
		;(async () => {
			const filter = contract.filters.NewItem()
			const events = await contract.queryFilter(filter, 0)
			const decoded = await Promise.all(events.map(decodeEvent))
			const indexed = decoded.reduce<Record<string, ChainItem>>(
				(object, item) => {
					object[item.metadata] = item
					return object
				},
				{}
			)
			setItems(indexed)
			setLoading(false)
			setLastUpdate(Date.now())
		})()
	}, [contract])

	return { loading, items, lastUpdate }
}

export const useMarketplaceItems = (
	waku: Waku | undefined,
	address: string
) => {
	const wakuItems = useGetWakuItems(waku, address)
	const chainItems = useGetMarketplaceItems(address)
	const [items, setItems] = useState<Item[]>([])

	useEffect(() => {
		const items = wakuItems.items.flatMap((item) => {
			const event = chainItems.items[item.hash]
			return event ? [{ ...event, metadata: item.metadata }] : []
		})
		setItems(items)
	}, [wakuItems.lastUpdate, chainItems.lastUpdate])

	return {
		waiting: wakuItems.waiting,
		loading: wakuItems.loading || chainItems.loading,
		items,
	}
}
