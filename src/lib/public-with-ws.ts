import { providers } from 'ethers'

import type { Chain } from '@wagmi/chains'
import type { ChainProviderFn, FallbackProviderConfig } from '@wagmi/core'

export type PublicProviderConfig = FallbackProviderConfig

export function publicProvider<TChain extends Chain = Chain>({
	priority,
	stallTimeout,
	weight,
}: PublicProviderConfig = {}): ChainProviderFn<
	TChain,
	providers.StaticJsonRpcProvider
> {
	return function (chain) {
		if (!chain.rpcUrls.default.http[0]) return null
		return {
			chain: chain as TChain,
			provider: () => {
				const provider = new providers.StaticJsonRpcProvider(
					chain.rpcUrls.default.http[0],
					{
						chainId: chain.id,
						name: chain.network,
						ensAddress: chain.contracts?.ensRegistry?.address,
					}
				)
				return Object.assign(provider, { priority, stallTimeout, weight })
			},
			...(chain.rpcUrls.default.webSocket?.[0] && {
				webSocketProvider: () => {
					if (!chain.rpcUrls.default.webSocket?.[0]) {
						throw new Error('WebSocket RPC missing')
					}

					return new providers.WebSocketProvider(
						chain.rpcUrls.default.webSocket[0],
						chain.id
					)
				},
			}),
		}
	}
}
