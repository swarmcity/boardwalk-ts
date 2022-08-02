// Types
import type { Chain } from 'wagmi'

const BLOCK_EXPLORER = {
	name: 'BlockScout',
	url: 'https://blockscout.com/xdai/mainnet/',
}

export const WAGMI_CHAIN: Chain = {
	id: 100,
	name: 'Gnosis Chain',
	network: 'gnosis-chain',
	nativeCurrency: {
		name: 'xDAI',
		symbol: 'xDAI',
		decimals: 18,
	},
	rpcUrls: {
		webSocket: 'wss://rpc.gnosischain.com/wss',
		default: 'https://rpc.ankr.com/gnosis',
	},
	blockExplorers: {
		default: BLOCK_EXPLORER,
	},
}
