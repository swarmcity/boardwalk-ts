import { getAddress } from '@ethersproject/address'
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

export const numberToBigInt = (number: number | string, decimals: number) => {
	const [whole, fraction = ''] = number.toString().split('.')
	const fractionTrimmed = fraction.substring(0, decimals)
	const zeroes = Array.from(
		{ length: decimals - fractionTrimmed.length },
		(_) => '0'
	)
	return BigInt(whole + fractionTrimmed + zeroes.join(''))
}

export const bufferToHex = (buffer: ArrayBuffer) => {
	return [...new Uint8Array(buffer)]
		.map((x) => x.toString(16).padStart(2, '0'))
		.join('')
}

export const displayAddress = (address: string) => {
	address = getAddress(address)
	return address.substring(0, 6) + '..' + address.substring(38)
}

export const dataUriToBlob = async (dataUri: string) => {
	return await (await fetch(dataUri)).blob()
}

export const formatFrom = (address: string, username?: string) => {
	if (!username) {
		return displayAddress(address)
	}

	return `${username} (${displayAddress(address)})`
}
