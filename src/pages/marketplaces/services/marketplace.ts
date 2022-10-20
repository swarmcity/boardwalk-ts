import { BigNumber, BigNumberish, Contract, Signer } from 'ethers'
import { useEffect, useMemo, useState } from 'react'
import { useProvider, useWebSocketProvider } from 'wagmi'
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
import { getCache, useCache } from '../../../lib/cache'

// Cache
const TOKEN_NAME_CACHE: Map<string, Promise<string> | undefined> = new Map()
const CONTRACT_NAME_CACHE: Map<string, Promise<string> | undefined> = new Map()
const CONTRACT_TOKEN_CACHE: Map<string, Promise<string> | undefined> = new Map()

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
	itemId: BigNumber
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
	const contract = useMarketplaceContract(address)
	return useCache(CONTRACT_NAME_CACHE, address, () => contract?.name(), [
		contract,
	])
}

export const getMarketplaceTokenContract = async (
	marketplace: string,
	signerOrProvider?: Signer | Provider
) => {
	const contract = getMarketplaceContract(marketplace, signerOrProvider)
	const token = await getCache(
		CONTRACT_TOKEN_CACHE,
		marketplace,
		contract.token
	)

	if (!token) {
		throw new Error('cache empty, should never happen')
	}

	return new Contract(token, erc20Abi, signerOrProvider)
}

export const useMarketplaceTokenContract = (marketplace?: string) => {
	const [token, setToken] = useState<Contract | undefined>()
	const provider = useProvider()

	useEffect(() => {
		if (marketplace) {
			getMarketplaceTokenContract(marketplace, provider).then(setToken)
		}
	}, [marketplace, provider])

	return token
}

export const useMarketplaceTokenDecimals = (address?: string) => {
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
	const wsProvider = useWebSocketProvider()
	const contract = useMarketplaceContract(marketplace)
	const [item, setItem] = useState<MarketplaceItem>()
	const [lastUpdate, setLastUpdate] = useState(Date.now())
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		if (!wsProvider) {
			return
		}

		const wsContract = contract.connect(wsProvider)

		const statusFilter = contract.filters.ItemStatusChange(itemId)
		const statusListener = (_: BigNumberish, status: Status) => {
			setItem((item) => item && { ...item, status })
		}

		const fundFilter = contract.filters.FundItem(null, itemId)
		const fundListener = (providerAddress: string) => {
			// TODO: Fetch `providerRep`
			setItem((item) => item && { ...item, providerAddress, providerRep: 0n })
		}

		contract.items(itemId).then((item: Array<BigNumberish | string>) => {
			setItem(cleanOutput(item))
			setLastUpdate(Date.now())
			setLoading(false)

			wsContract.on(statusFilter, statusListener)
			wsContract.on(fundFilter, fundListener)
		})

		return () => {
			wsContract.off(statusFilter, statusListener)
			wsContract.off(fundFilter, fundListener)
		}
	}, [marketplace, itemId, wsProvider])

	return { item, lastUpdate, loading }
}

export const useMarketplaceSeekerReputation = (
	marketplace: string,
	user?: string
) => {
	const config = useMarketplaceConfig(marketplace, ['seekerRep'])
	return useReputation(config?.seekerRep, user)
}

export const useMarketplaceProviderReputation = (
	marketplace: string,
	user?: string
) => {
	const config = useMarketplaceConfig(marketplace, ['providerRep'])
	return useReputation(config?.providerRep, user)
}

export const useMarketplaceDealCount = (marketplace: string) => {
	const config = useMarketplaceConfig(marketplace, ['itemId'])
	return useMemo(
		() => config?.itemId.sub(1) ?? BigNumber.from(0),
		[config?.itemId]
	)
}

export const useMarketplaceTokenName = (
	address?: string
): string | undefined => {
	const token = useMarketplaceTokenContract(address)
	return useCache(TOKEN_NAME_CACHE, address, () => token?.name(), [token])
}

export const useMarketplaceTokenBalanceOf = (
	address?: string,
	userAddress?: string
): BigNumber | undefined => {
	const [balance, setBalance] = useState<BigNumber | undefined>()
	const token = useMarketplaceTokenContract(address)

	useEffect(() => {
		token?.balanceOf(userAddress).then(setBalance)
	}, [token])

	return balance
}

export const useToken = (tokenAddress?: string): Contract | undefined => {
	const provider = useProvider()
	const token = useMemo(
		() =>
			tokenAddress ? new Contract(tokenAddress, erc20Abi, provider) : undefined,
		[tokenAddress]
	)

	return token
}

export const useTokenBalanceOf = (
	tokenAddress?: string,
	userAddress?: string
): BigNumber | undefined => {
	const [balance, setBalance] = useState<BigNumber | undefined>()
	const token = useToken(tokenAddress)

	useEffect(() => {
		token?.balanceOf(userAddress).then(setBalance)
	}, [token])

	return balance
}

export const useTokenName = (tokenAddress?: string): string | undefined => {
	const token = useToken(tokenAddress)

	return useCache(TOKEN_NAME_CACHE, tokenAddress, () => token?.name(), [token])
}

export const useTokenDecimals = (tokenAddress?: string) => {
	const [loading, setLoading] = useState(true)
	const [decimals, setDecimals] = useState<number | undefined>(undefined)

	// Get the marketplace contract
	const token = useToken(tokenAddress)

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
