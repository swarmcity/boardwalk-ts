import { gnosis } from '@wagmi/chains'

// Types
import type { Chain } from 'wagmi'

export const WAGMI_CHAIN: Chain = gnosis
export const HASHTAG_FACTORY = ''

const { http } = WAGMI_CHAIN.rpcUrls.default
const webSocket = ['wss://rpc.gnosischain.com/wss']

WAGMI_CHAIN.rpcUrls = {
	public: { http, webSocket },
	default: { http, webSocket },
}
