import { polygonZkEvm } from '@wagmi/chains'

// Types
import type { Chain } from 'wagmi'

export const WAGMI_CHAIN: Chain = polygonZkEvm
export const MARKETPLACE_LIST = '0x6AB0c42ff1000561c5DF9249B5A53A5662006b60'
export const HASHTAG_FACTORY = '0x17F55dAe13eD89eA37c9fc2cD204466b43A46727'
export const APP_TOKEN = '0xC5015b9d9161Dca7e18e32f6f25C4aD850731Fd4'

const { http } = WAGMI_CHAIN.rpcUrls.default
const webSocket = ['wss://zkevm-rpc.com']

WAGMI_CHAIN.rpcUrls = {
	public: { http, webSocket },
	default: { http, webSocket },
}
