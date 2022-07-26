import { chain } from 'wagmi'

// Types
import type { Chain } from 'wagmi'
import type { Networkish } from '@ethersproject/networks'

const ALCHEMY_URL = 'eth-goerli.alchemyapi.io'
const ALCHEMY_TOKEN = 'GPR_qF9l_vj-iDb1Kdg3cjDBB-ktJ7Lt'

export const WAGMI_CHAIN: Chain = {
	...chain.goerli,
	rpcUrls: {
		default: `https://${ALCHEMY_URL}/v2/${ALCHEMY_TOKEN}`,
		websocket: `wss://${ALCHEMY_URL}/v2/${ALCHEMY_TOKEN}`,
	},
}

export const WAGMI_NETWORK: Networkish = {
	chainId: WAGMI_CHAIN.id,
	name: WAGMI_CHAIN.name,
}
