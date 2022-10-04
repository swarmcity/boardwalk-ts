import { useEffect, useState } from 'react'
import { Wallet } from 'ethers'
import { WakuMessage, utils } from 'js-waku'
import { verifyTypedData } from '@ethersproject/wallet'
import { getAddress } from '@ethersproject/address'

// Types
import type {
	TypedDataDomain,
	TypedDataField,
} from '@ethersproject/abstract-signer'
import type { Waku } from 'js-waku'
import type { BigNumber, Signer } from 'ethers'

// Protos
import { ItemReply } from '../../../protos/item-reply'

// Hooks
import { useWakuStoreQuery } from '../../../services/waku'

export type CreateReply = {
	text: string
}

export type ItemReplyClean = {
	marketplace: string
	item: bigint
	text: string
	from: string
	signature: string
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

	// Post the metadata on Waku
	const message = await WakuMessage.fromBytes(
		reply,
		getItemTopic(marketplace, item.toString())
	)

	await waku.relay.send(message)
}

type WakuMessageWithPayload = WakuMessage & { get payload(): Uint8Array }

const verifyReplySignature = (reply: ItemReply) => {
	const from = getAddress('0x' + utils.bytesToHex(reply.from))
	const recovered = verifyTypedData(
		DOMAIN,
		TYPES,
		{
			from,
			marketplace: reply.marketplace,
			item: reply.item,
			text: reply.text,
		},
		reply.signature
	)
	return recovered === from
}

const decodeWakuReply = async (
	message: WakuMessageWithPayload
): Promise<ItemReplyClean | false> => {
	try {
		const reply = ItemReply.decode(message.payload)
		return (
			verifyReplySignature(reply) && {
				marketplace: reply.marketplace,
				item: reply.item,
				text: reply.text,
				from: getAddress('0x' + utils.bytesToHex(reply.from)),
				signature: '0x' + utils.bytesToHex(reply.signature),
			}
		)
	} catch (err) {
		return false
	}
}

const decodeWakuReplies = (
	messages: WakuMessage[]
): Promise<ItemReplyClean | false>[] => {
	return messages.flatMap((message) =>
		message.payload ? decodeWakuReply(message as WakuMessageWithPayload) : []
	)
}

export const useItemReplies = (marketplace: string, item: bigint) => {
	const [replies, setReplies] = useState<ItemReplyClean[]>([])
	const [lastUpdate, setLastUpdate] = useState(Date.now())

	const callback = (messages: WakuMessage[]) => {
		// eslint-disable-next-line @typescript-eslint/no-extra-semi
		;(async () => {
			const decoded = await Promise.all(decodeWakuReplies(messages))
			const filtered = decoded.filter(Boolean) as ItemReplyClean[]
			setReplies((replies) => [...replies, ...filtered])
			setLastUpdate(Date.now())
		})()
	}

	const topic = getItemTopic(marketplace, item.toString())
	const state = useWakuStoreQuery(callback, () => topic, [topic])

	useEffect(() => (state.loading ? setReplies([]) : undefined), [state.loading])

	return { ...state, lastUpdate, replies }
}
