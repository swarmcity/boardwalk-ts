import { BigNumberish, Contract } from 'ethers'
import { useEffect, useMemo, useState } from 'react'
import { useProvider } from 'wagmi'
import { JsonRpcBatchProvider, JsonRpcProvider } from '@ethersproject/providers'

// ABIs
import marketplaceAbi from '../../../abis/marketplace.json'
import erc20Abi from '../../../abis/erc20.json'

// Lib
import { cleanOutput } from '../../../lib/ethers'

// Services
import { Status } from './marketplace-items'

// Types
export type MarketplaceItem = {
	fee: bigint
	metadata: string
	price: bigint
	providerAddress: string
	providerRep: bigint
	seekerAddress: string
	seekerRep: bigint
	status: Status
}

export const useMarketplaceContract = (address: string) => {
	const provider = useProvider()
	return useMemo(
		() => new Contract(address, marketplaceAbi, provider),
		[address, provider]
	)
}

type MarketplaceConfig = {
	name: string
	fee: BigNumberish
	token: string
	providerRep: string
	seekerRep: string
	payoutAddress: string
	metadataHash: string
}

export const useMarketplaceConfig = <Keys extends keyof MarketplaceConfig>(
	address: string,
	keys: Keys[]
) => {
	// Create a batch provider for efficient lookup
	const provider = useProvider()
	const batchProvider = useMemo(() => {
		return provider instanceof JsonRpcProvider
			? new JsonRpcBatchProvider(provider.connection, provider.network)
			: provider
	}, [provider])

	// Get the contract using said provider
	const contract = useMemo(
		() => new Contract(address, marketplaceAbi, batchProvider),
		[address, batchProvider]
	)

	// Final state
	const [config, setConfig] = useState<Pick<MarketplaceConfig, Keys>>()

	useEffect(() => {
		if (!contract.address) {
			return
		}

		// eslint-disable-next-line @typescript-eslint/no-extra-semi
		;(async () => {
			// Fetch all required keys
			const elements = await Promise.all(
				keys.map(async (key) => ({ key, value: await contract[key]() }))
			)

			// Convert the array to a MarketplaceConfig object
			const config = elements.reduce((result, { key, value }) => {
				result[key] = value
				return result
			}, {} as Pick<MarketplaceConfig, Keys>)

			setConfig(config)
		})()
	}, [contract, ...keys])

	return config
}

export const useMarketplaceName = (address: string) => {
	const [name, setName] = useState()
	const contract = useMarketplaceContract(address)

	useEffect(() => {
		contract.name().then(setName)
	}, [contract])

	return name
}

export const useMarketplaceTokenContract = (address: string) => {
	const [token, setToken] = useState<Contract>()

	// Get the marketplace contract
	const provider = useProvider()
	const contract = useMarketplaceContract(address)

	useEffect(() => {
		// eslint-disable-next-line @typescript-eslint/no-extra-semi
		;(async () => {
			const token = new Contract(await contract.token(), erc20Abi, provider)
			setToken(token)
		})()
	}, [contract])

	return token
}

export const useMarketplaceTokenDecimals = (address: string) => {
	const [loading, setLoading] = useState(true)
	const [decimals, setDecimals] = useState<number | undefined>(undefined)

	// Get the marketplace contract
	const token = useMarketplaceTokenContract(address)

	useEffect(() => {
		if (!token) {
			return
		}

		// eslint-disable-next-line @typescript-eslint/no-extra-semi
		;(async () => {
			setDecimals(await token.decimals())
			setLoading(false)
		})()
	}, [token])

	return { decimals, loading }
}

export const useMarketplaceItem = (marketplace: string, itemId: bigint) => {
	const contract = useMarketplaceContract(marketplace)
	const [item, setItem] = useState<MarketplaceItem>()
	const [lastUpdate, setLastUpdate] = useState(Date.now())
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		contract.items(itemId).then((item: Array<BigNumberish | string>) => {
			setItem(cleanOutput(item))
			setLastUpdate(Date.now())
			setLoading(false)
		})
	}, [marketplace, itemId])

	return { item, lastUpdate, loading }
}
