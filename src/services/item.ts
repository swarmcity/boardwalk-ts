import { splitSignature } from '@ethersproject/bytes'

// Types
import type { Signer } from 'ethers'

// Services
import {
	getMarketplaceContract,
	getMarketplaceTokenContract,
} from '../pages/marketplaces/services/marketplace'

export const fundItem = async (
	signer: Signer,
	marketplace: string,
	item: bigint,
	signature: Uint8Array
) => {
	const contract = getMarketplaceContract(marketplace, signer)
	const token = await getMarketplaceTokenContract(marketplace, signer)

	// Get the price
	const { price, fee } = await contract.items(item)

	// Convert the price to bigint
	const amountToApprove = price.add(fee.div(2))

	// Approve the tokens to be spent by the marketplace
	const approveTx = await token.approve(marketplace, amountToApprove)
	await approveTx.wait()

	// Fund the item
	const { v, r, s } = splitSignature(signature)
	const tx = await contract.fundItem(item, v, r, s)
	await tx.wait()
}

export const cancelItem = async (
	signer: Signer,
	marketplace: string,
	item: bigint
) => {
	const contract = getMarketplaceContract(marketplace, signer)
	const tx = await contract.cancelItem(item)
	await tx.wait()
}

export const payoutItem = async (
	signer: Signer,
	marketplace: string,
	item: bigint
) => {
	const contract = getMarketplaceContract(marketplace, signer)
	const tx = await contract.payoutItem(item)
	await tx.wait()
}
