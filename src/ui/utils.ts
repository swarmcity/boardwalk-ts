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

export function formatMoney(amount: bigint | BigNumber, decimals = 18) {
	const base =
		typeof amount === 'bigint' ? Number(amount) : Number(amount.toBigInt())
	return base / 10 ** decimals
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
