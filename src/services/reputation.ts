import { useEffect, useMemo, useState } from 'react'
import { Contract } from 'ethers'
import { useProvider } from 'wagmi'

// Types
import type { BigNumberish } from 'ethers'

// ABIs
import erc20Abi from '../abis/erc20.json'

export const useReputationContract = (contract?: string) => {
	const provider = useProvider()
	return useMemo(
		() => contract && new Contract(contract, erc20Abi, provider),
		[contract]
	)
}

export const useReputation = (token: string | undefined, user: string) => {
	const contract = useReputationContract(token)
	const [balance, setBalance] = useState<BigNumberish>()

	useEffect(() => {
		if (!contract) {
			return
		}

		contract.balanceOf(user).then(setBalance)
	}, [contract])

	return balance
}
