import { arrayify } from '@ethersproject/bytes'
import { getAddress } from '@ethersproject/address'
import { verifyTypedData, Wallet } from '@ethersproject/wallet'

// Types
import type {
	TypedDataDomain,
	TypedDataField,
	Signer,
} from '@ethersproject/abstract-signer'
import type { SignatureLike } from '@ethersproject/bytes'
import type { Uint8ArrayList } from 'uint8arraylist'

// Custom types
export type EIP712Config = {
	domain: TypedDataDomain
	types: Record<string, TypedDataField[]>
}

type Proto<ProtoType> = {
	encode: (obj: ProtoType) => Uint8Array
	decode: (buf: Uint8Array | Uint8ArrayList) => ProtoType
}

type SignedPayload<Values> = Values & { signature: Uint8Array }

type VerifyPayloadConfig<ProtoType> = {
	formatValue: (payload: ProtoType, address: string) => Record<string, unknown>
	getSigner: (payload: ProtoType) => string | Uint8Array
	getSignature?: (payload: ProtoType) => SignatureLike
}

// Defaults
const defaultGetSignature = (data: Record<string, unknown>): SignatureLike =>
	data.signature as SignatureLike

const getSignerString = (signer: string | Uint8Array) => {
	if (typeof signer === 'string') {
		return signer
	}
	return getAddress('0x' + arrayify(signer))
}

const getVerifyPayloadConfig = <ProtoType>(
	config: VerifyPayloadConfig<ProtoType>
) => {
	return {
		...config,
		getSignature: config.getSignature || defaultGetSignature,
	}
}

export const verifyPayload = <ProtoType extends Record<string, unknown>>(
	{ domain, types }: EIP712Config,
	config: VerifyPayloadConfig<ProtoType>,
	payload: ProtoType
) => {
	const { getSigner, formatValue, getSignature } =
		getVerifyPayloadConfig(config)
	const address = getSignerString(getSigner(payload))
	const recovered = verifyTypedData(
		domain,
		types,
		formatValue(payload, address),
		getSignature(payload)
	)
	return recovered === address
}

export const decodeSignedPayload = <
	Values extends Record<string, unknown>,
	ProtoType extends SignedPayload<Values>
>(
	eip712Config: EIP712Config,
	config: VerifyPayloadConfig<ProtoType>,
	proto: Proto<ProtoType>,
	payload: Uint8Array
): ProtoType | false => {
	try {
		const decoded = proto.decode(payload)
		return verifyPayload(eip712Config, config, decoded) && decoded
	} catch (err) {
		return false
	}
}

export const createSignedPayload = async <
	Data extends Record<string, unknown>,
	DataToSigner extends Record<string, unknown>
>(
	config: EIP712Config,
	formatData: (signer: Uint8Array) => Data,
	formatDataToSign: (signer: string) => DataToSigner,
	signer: Signer
): Promise<Data & { signature: Uint8Array }> => {
	const address = await signer.getAddress()

	// Data to sign and in the Waku message
	const data = formatData(arrayify(address))
	const values = formatDataToSign(address)

	// Check if the signer is a Wallet
	if (!(signer instanceof Wallet)) {
		throw new Error('not implemented yet')
	}

	// Sign the message
	const signatureHex = await signer._signTypedData(
		config.domain,
		config.types,
		values
	)
	const signature = arrayify(signatureHex)

	// Return the data with signature
	return { ...data, signature }
}

export const createSignedProto = async <
	Data extends Record<string, unknown>,
	DataToSigner extends Record<string, unknown>
>(
	config: EIP712Config,
	formatData: (signer: Uint8Array) => Data,
	formatDataToSign: (signer: string) => DataToSigner,
	proto: Proto<SignedPayload<Data>>,
	signer: Signer
): Promise<Uint8Array> => {
	const payload = await createSignedPayload(
		config,
		formatData,
		formatDataToSign,
		signer
	)
	return proto.encode(payload)
}
