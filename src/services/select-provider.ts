import { arrayify, hexlify } from '@ethersproject/bytes'
import { getAddress } from '@ethersproject/address'
import { MessageV0 } from 'js-waku/lib/waku_message/version_0'

// Types
import type { WakuLight } from 'js-waku/lib/interfaces'
import type { Signer } from 'ethers'

// Protos
import { SelectProvider } from '../protos/select-provider'

// Services
import { postWakuMessage, useLatestTopicData, WithPayload } from './waku'
import { createSignedProto, decodeSignedPayload, EIP712Config } from './eip-712'
import { generateChatKeys, getKeyExchange } from './chat'

type Marketplace = {
	address: string
	name: string
	chainId: bigint
}

type CreateSelectProvider = {
	marketplace: Marketplace
	provider: string
	item: bigint
}

// EIP-712
const eip712Config: EIP712Config = {
	domain: {
		version: '1',
	},
	types: {
		PermitProvider: [
			{ name: 'seeker', type: 'address' },
			{ name: 'provider', type: 'address' },
			{ name: 'item', type: 'uint256' },
			{ name: 'keyExchange', type: 'KeyExchange' },
		],

		// TODO: This is wrong as this signature is checked in the contract
		// and doesn't include the key exchange. So we need two different
		// messages with two different signatures. This makes everything
		// quite a bit more difficult.
		KeyExchange: [
			{ name: 'sigPubKey', type: 'bytes' },
			{ name: 'ecdhPubKey', type: 'bytes' },
		],
	},
}

export const formatSelectProviderEIP712Config = (marketplace: Marketplace) => {
	const config = { ...eip712Config }
	config.domain = {
		...config.domain,
		name: marketplace.name,
		chainId: marketplace.chainId,
		verifyingContract: marketplace.address,
	}
	return config
}

export const getSelectProviderTopic = (marketplace: string, itemId: bigint) => {
	marketplace = getAddress(marketplace)
	return `/swarmcity/1/marketplace-${marketplace}-item-${itemId}-select-provider/proto`
}

const toArray = <Condition extends boolean>(
	condition: Condition,
	string: string
): Condition extends true ? Uint8Array : string => {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	return (condition ? arrayify(string) : string) as any
}

export const createSelectProvider = async (
	waku: WakuLight,
	signer: Signer,
	data: CreateSelectProvider
) => {
	const topic = getSelectProviderTopic(data.marketplace.address, data.item)

	// Generate chat keys
	const keys = await generateChatKeys(data.marketplace.address, data.item)
	const keyExchange = await getKeyExchange(keys)

	const formatMarketplace = <Condition extends boolean>(array: Condition) => ({
		...data.marketplace,
		address: toArray(array, data.marketplace.address),
		chainId: BigInt(data.marketplace.chainId),
	})

	const formatData = <Condition extends boolean>(
		array: Condition,
		signer: Condition extends true ? Uint8Array : string
	) => ({
		seeker: signer,
		...data,
		marketplace: formatMarketplace(array),
		provider: toArray(array, data.provider),
		item: BigInt(data.item),
		keyExchange,
	})

	const payload = await createSignedProto(
		formatSelectProviderEIP712Config(data.marketplace),
		(signer: Uint8Array) => formatData(true, signer),
		(signer: string) => formatData(false, signer),
		SelectProvider,
		signer
	)

	return postWakuMessage(waku, topic, payload)
}

const decodeMessage = (
	message: WithPayload<MessageV0>
): SelectProvider | false => {
	return decodeSignedPayload(
		(decoded) =>
			formatSelectProviderEIP712Config({
				...decoded.marketplace,
				address: hexlify(decoded.marketplace.address),
			}),
		{
			formatValue: (data: SelectProvider) => ({
				seeker: hexlify(data.seeker),
				provider: hexlify(data.provider),
				item: data.item,
			}),
			getSigner: (data) => data.seeker,
		},
		SelectProvider,
		message.payload
	)
}

export const useSelectProvider = (marketplace: string, itemId: bigint) => {
	const { data, ...state } = useLatestTopicData(
		getSelectProviderTopic(marketplace, itemId),
		decodeMessage,
		true
	)
	return { ...state, data }
}
