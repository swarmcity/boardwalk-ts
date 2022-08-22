import { useEffect, useMemo, useState } from 'react'
import { waitForRemotePeer, Waku, WakuMessage } from 'js-waku'
import { BigNumber, Contract, Event } from 'ethers'
import { useProvider } from 'wagmi'
import { Interface } from 'ethers/lib/utils'

// Types
import type { Signer } from 'ethers'
import type { UpdateTime } from '../../../lib/blockchain'

// Protos
import { ItemMetadata } from '../../../protos/ItemMetadata'

// ABIs
import marketplaceAbi from '../../../abis/marketplace.json'
import erc20Abi from '../../../abis/erc20.json'

// Lib
import { bufferToHex, numberToBigInt } from '../../../lib/tools'
import { shouldUpdate } from '../../../lib/blockchain'

// Status
export enum Status {
	None,
	Open,
	Funded,
	Done,
	Disputed,
	Resolved,
	Cancelled,
}

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
	status: Status
}

type StatusChangeEvent = {
	id: BigNumber
	status: Status
}

export type Item = Omit<ChainItem, 'metadata'> & { metadata: ItemMetadata }

type WakuMessageWithPayload = WakuMessage & { get payload(): Uint8Array }

export const getItemTopic = (address: string) => {
	return `/swarmcity/1/marketplace-items-${address}/proto`
}

export const createItem = async (
	waku: Waku,
	marketplace: string,
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
	const contract = new Contract(marketplace, marketplaceAbi, signer)

	// Get token decimals
	const tokenAddress = await contract.token()
	const token = new Contract(tokenAddress, erc20Abi, signer)
	const decimals = await token.decimals()

	// Wait for peers
	// TODO: Should probably be moved somewhere else so the UI can access the state
	await promise

	// Post the metadata on Waku
	const message = await WakuMessage.fromBytes(
		metadata,
		getItemTopic(marketplace)
	)

	await waku.relay.send(message)

	// Convert the price to bigint
	const amount = numberToBigInt(price, decimals)
	const amountToApprove = amount + (await contract.fee()).toBigInt() / 2n

	// Approve the tokens to be spent by the marketplace
	let tx = await token.approve(marketplace, amountToApprove)
	await tx.wait()

	// Post the item on chain
	tx = await contract.newItem(amount, new Uint8Array(hash))
	await tx.wait()
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

export const useGetWakuItems = (
	waku: Waku | undefined,
	marketplace: string
) => {
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
			.queryHistory([getItemTopic(marketplace)], { callback })
			.then(() => setLoading(false))
	}, [waiting, marketplace])

	return { waiting, loading, items, lastUpdate }
}

const decodeNewItemEvent = async (
	event: Event,
	iface: Interface
): Promise<ChainItem> => {
	const { args } = iface.parseLog(event)
	const { timestamp } = await event.getBlock()

	return {
		owner: args.owner,
		id: args.id,
		metadata: args.metadata,
		price: args.price,
		fee: args.fee,
		seekerRep: args.seekerRep,
		timestamp,
		status: Status.Open,
	}
}

const decodeStatusChangeEvent = async (
	event: Event,
	iface: Interface
): Promise<StatusChangeEvent> => {
	const { args } = iface.parseLog(event)

	return {
		id: args.id,
		status: args.newstatus,
	}
}

type Metadata = UpdateTime & {
	metadata: string
}

type MetadataIndex = Record<string, Metadata>

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
		const metadata: MetadataIndex = {}
		const indexed: Record<string, ChainItem> = {}

		// eslint-disable-next-line @typescript-eslint/no-extra-semi
		;(async () => {
			const newItem = contract.interface.getEventTopic('NewItem')
			const statusChange = contract.interface.getEventTopic('ItemStatusChange')

			const events = await contract.queryFilter(
				{
					address: contract.address,
					topics: [[newItem, statusChange]],
				},
				0
			)

			for (const event of events) {
				const { blockNumber, transactionIndex, topics } = event

				switch (topics[0]) {
					case newItem:
						const item = await decodeNewItemEvent(event, contract.interface)
						metadata[item.id.toString()] = {
							blockNumber,
							transactionIndex,
							metadata: item.metadata,
						}
						indexed[item.metadata] = item
						break

					case statusChange:
						const { id, status } = await decodeStatusChangeEvent(
							event,
							contract.interface
						)
						const data = metadata[id.toString()]

						if (shouldUpdate(event, data)) {
							indexed[data.metadata].status = status
						}

						break
				}
			}

			setItems(indexed)
			setLoading(false)
			setLastUpdate(Date.now())
		})()
	}, [contract])

	return { loading, items, lastUpdate }
}

export const useMarketplaceItems = (
	waku: Waku | undefined,
	marketplace: string
) => {
	const wakuItems = useGetWakuItems(waku, marketplace)
	const chainItems = useGetMarketplaceItems(marketplace)
	const [items, setItems] = useState<Item[]>([])
	const [lastUpdate, setLastUpdate] = useState(Date.now())

	useEffect(() => {
		const items = wakuItems.items.flatMap((item) => {
			const event = chainItems.items[item.hash]
			return event ? [{ ...event, metadata: item.metadata }] : []
		})
		setItems(items)
		setLastUpdate(Date.now())
	}, [wakuItems.lastUpdate, chainItems.lastUpdate])

	return {
		waiting: wakuItems.waiting,
		loading: wakuItems.loading || chainItems.loading,
		lastUpdate,
		items,
	}
}
