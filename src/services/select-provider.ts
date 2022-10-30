import { arrayify, hexlify } from '@ethersproject/bytes'
import { getAddress } from '@ethersproject/address'
import { MessageV0 } from 'js-waku/lib/waku_message/version_0'

// Types
import type { WakuLight } from 'js-waku/lib/interfaces'
import type { Signer } from 'ethers'

// Protos
import { PermitProvider, SelectProvider } from '../protos/select-provider'
import { KeyExchange } from '../protos/key-exchange'

// Services
import { postWakuMessage, useLatestTopicData, WithPayload } from './waku'
import {
	createSignedPayload,
	decodeSignedPayload,
	EIP712Config,
	verifyPayload,
} from './eip-712'
import { getKeyExchange, setTheirTempChatKeys } from './chat'

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
const permitProviderEip712Config: EIP712Config = {
	domain: {
		version: '1',
	},
	types: {
		PermitProvider: [
			{ name: 'seeker', type: 'address' },
			{ name: 'provider', type: 'address' },
			{ name: 'item', type: 'uint256' },
		],
	},
}

const selectProviderEip712Config: EIP712Config = {
	domain: {
		name: 'Swarm.City',
		version: '1',
		salt: '0x35d7f7df089536c80c766d31e8aa85434b28f41226df287831d6e65421701bd8', // keccak256('select-provider')
	},
	types: {
		SelectProvider: [{ name: 'keyExchange', type: 'KeyExchange' }],
		KeyExchange: [
			{ name: 'sigPubKey', type: 'bytes' },
			{ name: 'ecdhPubKey', type: 'bytes' },
		],
	},
}

export const formatPermitProviderEIP712Config = (marketplace: Marketplace) => {
	const config = { ...permitProviderEip712Config }
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
	data: CreateSelectProvider,
	theirKeyExchange: KeyExchange
) => {
	const topic = getSelectProviderTopic(data.marketplace.address, data.item)

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
	})

	const permitProvider = await createSignedPayload(
		formatPermitProviderEIP712Config(data.marketplace),
		(signer: Uint8Array) => formatData(true, signer),
		(signer: string) => formatData(false, signer),
		signer
	)

	const keyExchange = await getKeyExchange(data.marketplace.address, data.item)
	const payload = await createSignedPayload(
		selectProviderEip712Config,
		() => ({ keyExchange }),
		() => ({ keyExchange }),
		signer
	)

	await setTheirTempChatKeys(
		data.marketplace.address,
		data.item,
		data.provider,
		theirKeyExchange
	)

	return postWakuMessage(
		waku,
		topic,
		SelectProvider.encode({ ...payload, permitProvider })
	)
}

const decodeMessage = (
	message: WithPayload<MessageV0>
): SelectProvider | false => {
	const selectProvider = decodeSignedPayload(
		selectProviderEip712Config,
		{
			formatValue: (data: SelectProvider) => ({
				keyExchange: data.keyExchange,
			}),
			getSigner: (data) => data.permitProvider.seeker,
		},
		SelectProvider,
		message.payload
	)

	if (!selectProvider) {
		return false
	}

	const { permitProvider } = selectProvider
	const verify = verifyPayload(
		formatPermitProviderEIP712Config({
			...permitProvider.marketplace,
			address: hexlify(permitProvider.marketplace.address),
		}),
		{
			formatValue: (data: PermitProvider) => ({
				seeker: hexlify(data.seeker),
				provider: hexlify(data.provider),
				item: data.item,
			}),
			getSigner: (data) => data.seeker,
		},
		permitProvider
	)

	return verify ? selectProvider : false
}

export const useSelectProvider = (marketplace: string, itemId: bigint) => {
	const { data, ...state } = useLatestTopicData(
		getSelectProviderTopic(marketplace, itemId),
		decodeMessage,
		true
	)
	return { ...state, data }
}
