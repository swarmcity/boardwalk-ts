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

export const MARKETPLACE_LIST = '0xA47E93A5795f60919F9943CfAD5a197Cbc9B9444'
export const MARKETPLACE_FACTORY = '0x11b555C8De5F6e96f4ce605A74601dDeB0D2a5f1'
