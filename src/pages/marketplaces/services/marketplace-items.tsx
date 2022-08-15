import { Waku, WakuMessage } from 'js-waku'
import { Contract } from 'ethers'
import keccak256 from 'keccak256'

// Types
import type { Signer } from 'ethers'

// Protos
import { ItemMetadata } from '../../../protos/ItemMetadata'

// ABIs
import hashtagAbi from '../../../abis/hashtag.json'
import erc20Abi from '../../../abis/erc20.json'

// Tools
import { numberToBigInt } from '../../../lib/tools'

type Item = {
	price: number
	description: string
}

/*
function getPublicKey(signer: Signer) {
	if (signer instanceof Wallet) {
		return signer.publicKey
	}

	// TODO: Add something like https://docs.metamask.io/guide/rpc-api.html#eth-getencryptionpublickey-deprecated
	// Although it is deprecated. Alternatively, sign a message and ecrecover
	throw new Error('no implemented')
}
*/

export const getItemTopic = (address: string) => {
	return `/swarmcity/1/marketplace-items-${address}/proto`
}

export const createItem = async (
	waku: Waku,
	address: string,
	{ price, description }: Item,
	connector: { getSigner: () => Promise<Signer> }
): Promise<string> => {
	// Generate item id
	const key = crypto.randomUUID()
	const id = keccak256(key)

	// Get signer
	const signer = await connector.getSigner()

	// Create the metadata
	const metadata = ItemMetadata.encode({ id, description })
	const hash = await crypto.subtle.digest('SHA-256', metadata)

	// Get the marketplace contract
	const contract = new Contract(address, hashtagAbi, signer)

	// Get token decimals
	const tokenAddress = await contract.token()
	const token = new Contract(tokenAddress, erc20Abi, signer)
	const decimals = await token.decimals()

	// Post the item on chain
	await contract.newItem(id, numberToBigInt(price, decimals), hash)

	// Post the metadata on Waku
	const message = await WakuMessage.fromBytes(metadata, getItemTopic(address))

	await waku.waitForRemotePeer()
	await waku.relay.send(message)

	return key
}

export const listItems = async (waku: Waku, address: string) => {
	await waku.waitForRemotePeer()

	const callback = (messages: WakuMessage[]) => {
		const items = messages
			.map((message) => message.payload && ItemMetadata.decode(message.payload))
			.filter(Boolean)

		console.log(items)
	}

	waku.store.queryHistory([getItemTopic(address)], { callback })
}
