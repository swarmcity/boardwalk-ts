import { gnosis } from '@wagmi/chains'
import { constants } from 'ethers'

// Types
import type { Chain } from 'wagmi'

export const WAGMI_CHAIN: Chain = gnosis
export const MARKETPLACE_LIST = '0x72FdB3f1B2A70F4B969864D0B7EcB246B4Ba5F7F'
export const HASHTAG_FACTORY = '0x1872524b7D5F0BbB975E2E9EE1a226b72c2dB0D3'
export const APP_TOKEN = constants.AddressZero

const { http } = WAGMI_CHAIN.rpcUrls.default
const webSocket = ['wss://rpc.gnosischain.com/wss']

WAGMI_CHAIN.rpcUrls = {
	public: { http, webSocket },
	default: { http, webSocket },
}
