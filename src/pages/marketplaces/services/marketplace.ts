import { Contract } from 'ethers'
import { useEffect, useMemo, useState } from 'react'
import { useProvider } from 'wagmi'

export const useMarketplaceContract = (address: string) => {
	const provider = useProvider()
	return useMemo(
		() =>
			new Contract(
				address,
				[
					{
						inputs: [],
						name: 'token',
						outputs: [
							{
								internalType: 'contract ERC20',
								name: '',
								type: 'address',
							},
						],
						stateMutability: 'view',
						type: 'function',
					},
				],
				provider
			),
		[address, provider]
	)
}

export const useMarketplaceTokenContract = (address: string) => {
	const [token, setToken] = useState<Contract>()

	// Get the marketplace contract
	const provider = useProvider()
	const contract = useMarketplaceContract(address)

	useEffect(() => {
		// eslint-disable-next-line @typescript-eslint/no-extra-semi
		;(async () => {
			const token = new Contract(
				await contract.token(),
				[
					{
						constant: true,
						inputs: [],
						name: 'decimals',
						outputs: [
							{
								name: '',
								type: 'uint8',
							},
						],
						payable: false,
						stateMutability: 'view',
						type: 'function',
					},
				],
				provider
			)
			setToken(token)
		})()
	}, [contract])

	return token
}

export const useMarketplaceTokenDecimals = (address: string) => {
	const [loading, setLoading] = useState(true)
	const [decimals, setDecimals] = useState(0)

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
