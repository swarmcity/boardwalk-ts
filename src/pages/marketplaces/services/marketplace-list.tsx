import { Contract, utils } from 'ethers'
import { useEffect, useMemo } from 'react'
import { useProvider } from 'wagmi'
import createStore from 'teaful'
import { defaultAbiCoder, getAddress } from 'ethers/lib/utils'

// Lib
import { readLocalStore, updateLocalStore } from '../../../lib/store'

// Config
import { HASHTAG_LIST } from '../../../config'

const PREFIX = 'marketplace-list'
const EVENT_ADDED = utils.id('HashtagAdded(address,string)')
const EVENT_REMOVED = utils.id('HashtagRemoved(address)')

type MarketplaceListItem = {
	address: string
	name: string
	blockNumber: number
	transactionIndex: number
	deleted?: boolean
}

type MarketplaceList = Record<string, MarketplaceListItem>

type MarketplaceStore = {
	list: MarketplaceList | undefined
	lastBlock: number | undefined
}

// Store
const { useStore } = createStore<MarketplaceStore>(
	{
		list: readLocalStore('list', PREFIX),
		lastBlock: readLocalStore('lastBlock', PREFIX),
	},
	({ store, prevStore }) => {
		updateLocalStore(store, prevStore, 'list', PREFIX)
		updateLocalStore(store, prevStore, 'lastBlock', PREFIX)
	}
)

export const useMarketplaceList = () => {
	const [list] = useStore.list()
	return list
}

type UpdateTime = {
	blockNumber: number
	transactionIndex: number
}

const shouldUpdate = (current: UpdateTime, last?: UpdateTime) => {
	if (!last) {
		return true
	}

	return (
		current.blockNumber > last.blockNumber &&
		current.transactionIndex > last.transactionIndex
	)
}

export const useMarketplaceListSync = () => {
	// State
	const [list, setList] = useStore.list()
	const [lastBlock, setLastBlock] = useStore.lastBlock()

	// Wagmi
	const provider = useProvider()
	const contract = useMemo(
		() => new Contract(HASHTAG_LIST, [], provider),
		[provider]
	)

	useEffect(() => {
		const marketplaces = { ...list }

		;(async () => {
			let currentBlock = lastBlock
			const events = await contract.queryFilter(
				{
					address: HASHTAG_LIST,
					topics: [[EVENT_ADDED, EVENT_REMOVED]],
				},
				(lastBlock ?? -1) + 1
			)

			for (const event of events) {
				const { topics, data, blockNumber, transactionIndex } = event
				const address = getAddress(topics[1].substring(topics[1].length - 40))

				if (!shouldUpdate(event, marketplaces[address])) {
					continue
				}

				switch (topics[0]) {
					case EVENT_ADDED:
						const [name] = defaultAbiCoder.decode(['string'], data)
						marketplaces[address] = {
							name,
							address,
							blockNumber,
							transactionIndex,
						}
						break

					case EVENT_REMOVED:
						if (marketplaces[address]) {
							marketplaces[address].deleted = true
						}
						break
				}

				currentBlock = event.blockNumber
			}

			setLastBlock(currentBlock)
			setList(marketplaces)
		})()
	}, [contract])

	return list
}
