import { splitSignature } from '@ethersproject/bytes'

// Types
import { Signer } from 'ethers'

// Services
import {
	approveFundAmount,
	getMarketplaceContract,
} from '../pages/marketplaces/services/marketplace'
import { setTheirChatKeys } from './chat'

// Protos
import { KeyExchange } from '../protos/key-exchange'

export const fundItem = async (
	signer: Signer,
	marketplace: string,
	item: bigint,
	signature: Uint8Array,
	keyExchange: KeyExchange
) => {
	const contract = getMarketplaceContract(marketplace, signer)

	// Get the price and fee
	const { price, fee } = await contract.items(item)

	// Get the amounts and approve the token if necessary
	const { value } = await approveFundAmount(
		contract,
		price.toBigInt(),
		signer,
		fee.toBigInt()
	)

	// Fund the item
	const { v, r, s } = splitSignature(signature)
	const tx = await contract.fundItem(item, v, r, s, { value })
	await tx.wait()

	// Set the keys of the item once we fund it
	await setTheirChatKeys(marketplace, item, keyExchange)
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
