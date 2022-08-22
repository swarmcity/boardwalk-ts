import { Wallet } from 'ethers'
import { waitForRemotePeer, WakuMessage, utils } from 'js-waku'

// Types
import type {
	TypedDataDomain,
	TypedDataField,
} from '@ethersproject/abstract-signer'
import type { Waku } from 'js-waku'
import type { BigNumber, Signer } from 'ethers'

// Protos
import { ItemReply } from '../../../protos/ItemReply'

type CreateReply = {
	text: string
}

// EIP-712
const DOMAIN: TypedDataDomain = {
	name: 'Swarm.City',
	version: '1',

	// keccak256('marketplace-item-reply')
	salt: '0x7382101104be2061b115d6fbbf729e3000d6d57cab3710d57976c9af0036db23',
}

// The named list of all type definitions
const TYPES: Record<string, Array<TypedDataField>> = {
	Reply: [
		{ name: 'marketplace', type: 'string' },
		{ name: 'item', type: 'uint256' },
		{ name: 'from', type: 'address' },
		{ name: 'text', type: 'string' },
	],
}

export const getItemTopic = (marketplace: string, item: string) => {
	return `/swarmcity/1/marketplace-${marketplace}-item-${item}/proto`
}

export const createReply = async (
	waku: Waku,
	marketplace: string,
	item: BigNumber,
	{ text }: CreateReply,
	connector: { getSigner: () => Promise<Signer> }
) => {
	const promise = waitForRemotePeer(waku)

	// Get signer
	const signer = await connector.getSigner()
	const from = await signer.getAddress()

	if (!(signer instanceof Wallet)) {
		throw new Error('not implemented yet')
	}

	// Data to sign and in the Waku message
	const data = { from, marketplace, item: item.toBigInt(), text }

	// Sign the message
	const signatureHex = await signer._signTypedData(DOMAIN, TYPES, data)
	const signature = utils.hexToBytes(signatureHex)

	// Create the metadata
	const reply = ItemReply.encode({
		...data,
		from: utils.hexToBytes(from.substring(2).toLowerCase()),
		signature,
	})

	// Wait for peers
	// TODO: Should probably be moved somewhere else so the UI can access the state
	await promise

	// Post the metadata on Waku
	const message = await WakuMessage.fromBytes(
		reply,
		getItemTopic(marketplace, item.toString())
	)

	await waku.relay.send(message)
}
