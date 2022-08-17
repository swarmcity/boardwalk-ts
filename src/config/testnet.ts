import { chain } from 'wagmi'

// Types
import type { Chain } from 'wagmi'

const ALCHEMY_URL = 'eth-goerli.alchemyapi.io'
const ALCHEMY_TOKEN = 'GPR_qF9l_vj-iDb1Kdg3cjDBB-ktJ7Lt'

export const WAGMI_CHAIN: Chain = {
	...chain.goerli,
	rpcUrls: {
		default: `https://${ALCHEMY_URL}/v2/${ALCHEMY_TOKEN}`,
		webSocket: `wss://${ALCHEMY_URL}/v2/${ALCHEMY_TOKEN}`,
	},
}

export const MARKETPLACE_LIST = '0xa71fcfad3dc52ae67242ef625b3616ac6e8b1c2d'
export const MARKETPLACE_FACTORY = '0x45986eA7f6897f20F46aabB8E0835d2e55Abd793'
