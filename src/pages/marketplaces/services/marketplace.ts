import { BigNumber, BigNumberish, Contract, Signer } from 'ethers'
import { useEffect, useMemo, useState } from 'react'
import { useProvider } from 'wagmi'
import {
	JsonRpcBatchProvider,
	JsonRpcProvider,
	Provider,
} from '@ethersproject/providers'

// ABIs
import marketplaceAbi from '../../../abis/marketplace.json'
import erc20Abi from '../../../abis/erc20.json'

// Lib
import { cleanOutput } from '../../../lib/ethers'

// Services
import { Status } from './marketplace-items'
import { useReputation } from '../../../services/reputation'

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

export const getMarketplaceContract = (
	address: string,
	signerOrProvider?: Signer | Provider
) => {
	return new Contract(address, marketplaceAbi, signerOrProvider)
}

export const useMarketplaceContract = (address: string) => {
	const provider = useProvider()
	return useMemo(
		() => getMarketplaceContract(address, provider),
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

export const getMarketplaceTokenContract = async (
	marketplace: string,
	signerOrProvider?: Signer | Provider
) => {
	const contract = getMarketplaceContract(marketplace, signerOrProvider)
	return new Contract(await contract.token(), erc20Abi, signerOrProvider)
}

export const useMarketplaceTokenContract = (marketplace: string) => {
	const [token, setToken] = useState<Contract>()
	const provider = useProvider()

	useEffect(() => {
		getMarketplaceTokenContract(marketplace, provider).then(setToken)
	}, [marketplace, provider])

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

export const useMarketplaceSeekerReputation = (
	marketplace: string,
	user: string
) => {
	const config = useMarketplaceConfig(marketplace, ['seekerRep'])
	return useReputation(config?.seekerRep, user)
}

export const useMarketplaceProviderReputation = (
	marketplace: string,
	user: string
) => {
	const config = useMarketplaceConfig(marketplace, ['providerRep'])
	return useReputation(config?.providerRep, user)
}

// TODO: Replace this with a public function once new contracts are deployed
export const useMarketplaceDealCount = (marketplace: string) => {
	const provider = useProvider()
	const [count, setCount] = useState<BigNumberish>()

	useEffect(() => {
		provider
			.getStorageAt(marketplace, 9)
			.then((count) => setCount(BigNumber.from(count).sub(1)))
	}, [marketplace])

	return count
}
