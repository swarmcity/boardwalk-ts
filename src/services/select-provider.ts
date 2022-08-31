// Types
import type { Waku } from 'js-waku'
import type { Signer } from 'ethers'

// Protos
import { SelectProvider } from '../protos/SelectProvider'

// Services
import {
	postWakuMessage,
	useLatestTopicData,
	WakuMessageWithPayload,
} from './waku'
import { createSignedProto, decodeSignedPayload, EIP712Config } from './eip-712'

// Hooks
import { arrayify } from '@ethersproject/bytes'

type Marketplace = {
	address: string
	name: string
	chainId: number
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
		Profile: [
			{ name: 'seeker', type: 'address' },
			{ name: 'provider', type: 'address' },
			{ name: 'item', type: 'uint256' },
		],
	},
}

export const getSelectProviderTopic = (marketplace: string, itemId: bigint) => {
	return `/swarmcity/1/marketplace-${marketplace}-item-${itemId}-select-provider/proto`
}

export const createSelectProvider = async (
	waku: Waku,
	connector: { getSigner: () => Promise<Signer> },
	data: CreateSelectProvider
) => {
	const signer = await connector.getSigner()
	const topic = getSelectProviderTopic(data.marketplace.address, data.item)
	const marketplace = {
		...data.marketplace,
		address: arrayify(data.marketplace.address),
		chainId: BigInt(data.marketplace.chainId),
	}
	const formatData = <S>(signer: S) => ({
		seeker: signer,
		...data,
		marketplace,
		provider: arrayify(data.provider),
		item: BigInt(data.item),
	})
	const payload = await createSignedProto(
		eip712Config,
		formatData,
		formatData,
		SelectProvider,
		signer
	)

	return postWakuMessage(waku, topic, payload)
}

const decodeMessage = (
	message: WakuMessageWithPayload
): SelectProvider | false => {
	return decodeSignedPayload(
		eip712Config,
		{
			formatValue: (data, address) => ({ ...data, address }),
			getSigner: (data) => data.seeker,
		},
		SelectProvider,
		message.payload
	)
}

export const useSelectProvider = (marketplace: string, itemId: bigint) => {
	const { data, ...state } = useLatestTopicData(
		getSelectProviderTopic(marketplace, itemId),
		decodeMessage
	)
	return { ...state, profile: data }
}
