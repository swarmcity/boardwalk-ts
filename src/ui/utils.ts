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
