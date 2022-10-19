import { BigNumber } from 'ethers'

export function formatName({
	name,
	address,
}: {
	name?: string
	address: string
}) {
	return (
		name ||
		`${address.substring(0, 6)}...${address.substring(address.length - 4)}`
	)
}

export function tokenToDecimals(amount: bigint | BigNumber, decimals = 18) {
	const base =
		typeof amount === 'bigint' ? Number(amount) : Number(amount.toBigInt())
	return base / 10 ** decimals
}

/**
 * Formats monetary amount with maximum of 2 decimals
 *
 * @param amount Amount to be represented as string
 * @returns
 */
export function amountToString(amount: number): string {
	// This is a bit of a trick. First the amount is converted into string with 2 fixed decimals
	// then parsed again as number and converted to string which makes does not print the 2 decimals
	return Number(amount.toFixed(2)).toString()
}

export function formatDate(date: Date) {
	return date.toLocaleString(undefined, {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: 'numeric',
		minute: '2-digit',
	})
}
