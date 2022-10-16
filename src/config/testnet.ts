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

export const MARKETPLACE_LIST = '0x4deffb84bc50a4233c1ae398e8f52b7329d7ca14'
export const MARKETPLACE_FACTORY = '0xFf3af76Cb3845664d0173a742E5358Fd565e69dc'
