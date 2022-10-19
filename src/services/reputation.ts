import { useEffect, useMemo, useState } from 'react'
import { Contract } from 'ethers'
import { useProvider } from 'wagmi'

// Types
import type { BigNumber } from 'ethers'

// ABIs
import erc20Abi from '../abis/erc20.json'

export const useReputationContract = (contract?: string) => {
	const provider = useProvider()
	return useMemo(
		() => contract && new Contract(contract, erc20Abi, provider),
		[contract]
	)
}

export const useReputation = (token?: string, user?: string) => {
	const contract = useReputationContract(token)
	const [balance, setBalance] = useState<BigNumber>()

	useEffect(() => {
		if (!contract || !user) {
			return
		}

		contract.balanceOf(user).then(setBalance)
	}, [contract])

	return balance
}
