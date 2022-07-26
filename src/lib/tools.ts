import type { FetchBalanceResult } from '@wagmi/core'

export const shuffle = <T>(array: T[], len = array.length) => {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1))
		;[array[i], array[j]] = [array[j], array[i]]
	}

	return array.slice(0, len)
}

export const formatBalance = (balance: FetchBalanceResult) => {
	const [whole, fraction] = balance.formatted.split('.')
	const toRound = `${fraction.substring(0, 2)}.${fraction.substring(2)}`
	const rounded = Math.round(parseFloat(toRound))
	return `${whole}.${rounded.toString().padStart(2, '0')} ${balance.symbol}`
}

export const formatAddressShort = (address: string) => {
	return `${address.substring(0, 5)}..${address.substring(39, 42)}`
}
