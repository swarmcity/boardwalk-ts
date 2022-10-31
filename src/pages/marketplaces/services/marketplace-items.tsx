import { useEffect, useMemo, useState } from 'react'
import {
	DecoderV0,
	EncoderV0,
	MessageV0,
} from 'js-waku/lib/waku_message/version_0'
import { BigNumber, Contract, Event } from 'ethers'
import { useProvider, useWebSocketProvider } from 'wagmi'
import { Interface } from 'ethers/lib/utils'
import { Log } from '@ethersproject/providers'

// Types
import type { Signer } from 'ethers'
import type { WakuLight } from 'js-waku/lib/interfaces'
import type { UpdateTime } from '../../../lib/blockchain'

// Protos
import { ItemMetadata } from '../../../protos/item-metadata'

// ABIs
import marketplaceAbi from '../../../abis/marketplace.json'
import erc20Abi from '../../../abis/erc20.json'

// Lib
import { bufferToHex, numberToBigInt } from '../../../lib/tools'
import { shouldUpdate } from '../../../lib/blockchain'

// Services
import { useWakuStoreQuery, WithPayload } from '../../../services/waku'

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
	timestamp: BigNumber
	status: Status
	transactions: Partial<Record<Status, string>>
	provider?: string
}

type StatusChangeEvent = {
	id: BigNumber
	status: Status
}

type FundItemEvent = {
	id: BigNumber
	provider: string
}

export type Item = Omit<ChainItem, 'metadata'> & { metadata: ItemMetadata }

export const getItemTopic = (address: string) => {
	return `/swarmcity/1/marketplace-items-${address}/proto`
}

export const createItem = async (
	waku: WakuLight,
	marketplace: string,
	{ price, description }: CreateItem,
	signer: Signer
) => {
	// Create the metadata
	const payload = ItemMetadata.encode({ description })
	const hash = await crypto.subtle.digest('SHA-256', payload)

	// Get the marketplace contract
	const contract = new Contract(marketplace, marketplaceAbi, signer)

	// Get token decimals
	const tokenAddress = await contract.token()
	const token = new Contract(tokenAddress, erc20Abi, signer)
	const decimals = await token.decimals()

	// Post the metadata on Waku
	await waku.lightPush.push(new EncoderV0(getItemTopic(marketplace)), {
		payload,
	})

	// Convert the price to bigint
	const amount = numberToBigInt(price, decimals)
	const amountToApprove = amount + (await contract.fee()).toBigInt() / 2n

	// Approve the tokens to be spent by the marketplace
	const approveTx = await token.approve(marketplace, amountToApprove)
	await approveTx.wait()

	// Post the item on chain
	const tx = await contract.newItem(amount, new Uint8Array(hash))
	const { logs } = await tx.wait()

	// Get the item ID
	const newItemTopic = contract.interface.getEventTopic('NewItem')
	const newItemLog = logs.find((log: Log) => log.topics[0] === newItemTopic)
	const { args } = contract.interface.parseLog(newItemLog)
	return args.id.toBigInt()
}

const decodeWakuMessage = async (
	message: WithPayload<MessageV0>
): Promise<WakuItem> => {
	const hash = await crypto.subtle.digest('SHA-256', message.payload)
	return {
		hash: '0x' + bufferToHex(hash),
		metadata: ItemMetadata.decode(message.payload),
	}
}

export const useGetWakuItems = (marketplace: string) => {
	const [items, setItems] = useState<WakuItem[]>([])
	const [lastUpdate, setLastUpdate] = useState(Date.now())

	const callback = async (msg: Promise<MessageV0 | undefined>) => {
		const message = await msg
		if (!message?.payload) {
			return
		}

		const decoded = await decodeWakuMessage(message as WithPayload<MessageV0>)
		if (!decoded) {
			return
		}

		setItems((items) => [...items, decoded])
		setLastUpdate(Date.now())
	}

	const topic = getItemTopic(marketplace)
	const state = useWakuStoreQuery([new DecoderV0(topic)], callback, [topic])

	useEffect(() => (state.loading ? setItems([]) : undefined), [state.loading])

	return { ...state, lastUpdate, items }
}

const decodeNewItemEvent = async (
	event: Event,
	iface: Interface
): Promise<ChainItem> => {
	const { args } = iface.parseLog(event)

	return {
		owner: args.owner,
		id: args.id,
		metadata: args.metadata,
		price: args.price,
		fee: args.fee,
		seekerRep: args.seekerRep,
		timestamp: args.timestamp,
		status: Status.Open,
		transactions: {},
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

const decodeFundItemEvent = async (
	event: Event,
	iface: Interface
): Promise<FundItemEvent> => {
	const { args } = iface.parseLog(event)

	return {
		id: args.id,
		provider: args.provider,
	}
}

type Metadata = UpdateTime & {
	metadata: string
}

type MetadataIndex = Record<string, Metadata>

export const useGetMarketplaceItems = (address: string) => {
	const [loading, setLoading] = useState(true)
	const [items, setItems] = useState<Record<string, ChainItem[]>>({})
	const [lastUpdate, setLastUpdate] = useState(Date.now())

	// Wagmi
	const provider = useProvider()
	const wsProvider = useWebSocketProvider()
	const contract = useMemo(
		() => new Contract(address, marketplaceAbi, provider),
		[provider, address]
	)
	const wsContract = useMemo(
		() => new Contract(address, marketplaceAbi, wsProvider),
		[wsProvider, address]
	)

	useEffect(() => {
		const metadata: MetadataIndex = {}
		const indexed: Record<string, ChainItem[]> = {}

		const updateMetadata = (
			id: BigNumber,
			metadata: string,
			status: Status,
			transactionHash: string
		) => {
			for (const item of indexed[metadata]) {
				if (item.id.eq(id)) {
					item.status = status
					item.transactions[status] = transactionHash
				}
			}
		}

		const updateProvider = (id: BigNumber, provider: string) => {
			const data = metadata[id.toString()]
			for (const item of indexed[data.metadata]) {
				if (item.id.eq(id)) {
					item.provider = provider
				}
			}
		}

		// Real time event listener
		const statusListener = (id: BigNumber, status: Status, event: Event) => {
			const data = metadata[id.toString()]

			if (shouldUpdate(event, data)) {
				updateMetadata(id, data.metadata, status, event.transactionHash)
				setItems(indexed)
				setLastUpdate(Date.now())
			}
		}

		const fundListener = (provider: string, id: BigNumber) => {
			updateProvider(id, provider)
			setItems(indexed)
			setLastUpdate(Date.now())
		}

		// eslint-disable-next-line @typescript-eslint/no-extra-semi
		;(async () => {
			const newItem = contract.interface.getEventTopic('NewItem')
			const statusChange = contract.interface.getEventTopic('ItemStatusChange')
			const fundItem = contract.interface.getEventTopic('FundItem')

			// Listen to logs in real time
			wsContract.on('ItemStatusChange', statusListener)
			wsContract.on('FundItem', fundListener)

			// Fetch historical
			const events = await contract.queryFilter(
				{
					address: contract.address,
					topics: [[newItem, statusChange, fundItem]],
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
						if (!indexed[item.metadata]) {
							indexed[item.metadata] = []
						}
						indexed[item.metadata].push(item)
						break

					case statusChange:
						// eslint-disable-next-line no-lone-blocks
						{
							const { id, status } = await decodeStatusChangeEvent(
								event,
								contract.interface
							)
							const data = metadata[id.toString()]

							if (shouldUpdate(event, data)) {
								updateMetadata(id, data.metadata, status, event.transactionHash)
							}
						}
						break

					case fundItem:
						// eslint-disable-next-line no-lone-blocks
						{
							const { id, provider } = await decodeFundItemEvent(
								event,
								contract.interface
							)

							updateProvider(id, provider)
						}

						break
				}
			}

			setItems(indexed)
			setLoading(false)
			setLastUpdate(Date.now())
		})()

		return () => {
			wsContract.off('ItemStatusChange', statusListener)
			wsContract.off('FundItem', fundListener)
		}
	}, [contract])

	return { loading, items, lastUpdate }
}

export const useMarketplaceItems = (marketplace: string) => {
	const wakuItems = useGetWakuItems(marketplace)
	const chainItems = useGetMarketplaceItems(marketplace)
	const [items, setItems] = useState<Item[]>([])
	const [lastUpdate, setLastUpdate] = useState(Date.now())

	useEffect(() => {
		const itemsCopy = { ...chainItems.items }
		const items = wakuItems.items.flatMap((item) => {
			const events = itemsCopy[item.hash] || []
			delete itemsCopy[item.hash]
			return events.map((event) => ({ ...event, metadata: item.metadata }))
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
