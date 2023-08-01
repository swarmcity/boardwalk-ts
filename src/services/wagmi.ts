import { useMemo } from 'react'
import { useNetwork, useProvider } from 'wagmi'

export const useNativeCurrency = () => {
	const { chain } = useNetwork()
	const { chains } = useProvider()

	return useMemo(() => {
		return (
			chain?.nativeCurrency.symbol ?? chains?.[0].nativeCurrency.symbol ?? '?'
		)
	}, [chain, chains])
}
