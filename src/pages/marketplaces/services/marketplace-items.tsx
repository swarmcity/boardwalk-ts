import { waitForRemotePeer, Waku, WakuMessage } from 'js-waku'
import { Contract } from 'ethers'

// Types
import type { Signer } from 'ethers'

// Protos
import { ItemMetadata } from '../../../protos/ItemMetadata'

// ABIs
import hashtagAbi from '../../../abis/marketplace.json'
import erc20Abi from '../../../abis/erc20.json'

// Tools
import { numberToBigInt } from '../../../lib/tools'

type Item = {
	price: number
	description: string
}

export const getItemTopic = (address: string) => {
	return `/swarmcity/1/marketplace-items-${address}/proto`
}

export const createItem = async (
	waku: Waku,
	address: string,
	{ price, description }: Item,
	connector: { getSigner: () => Promise<Signer> }
) => {
	const promise = waitForRemotePeer(waku)

	// Get signer
	const signer = await connector.getSigner()

	// Create the metadata
	const metadata = ItemMetadata.encode({ description })
	const hash = await crypto.subtle.digest('SHA-256', metadata)

	// Get the marketplace contract
	const contract = new Contract(address, hashtagAbi, signer)

	// Get token decimals
	const tokenAddress = await contract.token()
	const token = new Contract(tokenAddress, erc20Abi, signer)
	const decimals = await token.decimals()

	// Wait for peers
	// TODO: Should probably be moved somewhere else so the UI can access the state
	await promise

	// Post the item on chain
	await contract.newItem(numberToBigInt(price, decimals), new Uint8Array(hash))

	// Post the metadata on Waku
	const message = await WakuMessage.fromBytes(metadata, getItemTopic(address))

	await waitForRemotePeer(waku)
	await waku.relay.send(message)
}

export const listItems = async (waku: Waku, address: string) => {
	await waitForRemotePeer(waku)

	const callback = (messages: WakuMessage[]) => {
		const items = messages
			.map((message) => message.payload && ItemMetadata.decode(message.payload))
			.filter(Boolean)

		console.log(items)
	}

	waku.store.queryHistory([getItemTopic(address)], { callback })
}
