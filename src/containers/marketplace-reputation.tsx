import { HTMLAttributes } from 'react'
import { useMarketplaceConfig } from '../pages/marketplaces/services/marketplace'
import { useReputation } from '../services/reputation'
import { MarketplaceReputation } from '../ui/components/marketplace-reputation'

interface Props extends HTMLAttributes<HTMLDivElement> {
	marketplaceId: string
	marketplaceName: string
	userAddress?: string
}

export function MarketplaceReputationContainer({
	marketplaceId,
	marketplaceName,
	userAddress,
	...props
}: Props) {
	const repToken = useMarketplaceConfig(marketplaceId, [
		'providerRep',
		'seekerRep',
	])
	const seekerRepString = useReputation(repToken?.providerRep, userAddress)
	const providerRepString = useReputation(repToken?.seekerRep, userAddress)

	const seekerRep = Number(seekerRepString?.toString() || 0)
	const providerRep = Number(providerRepString?.toString() || 0)

	return (
		<MarketplaceReputation
			marketplaceName={marketplaceName}
			seekerRep={seekerRep}
			providerRep={providerRep}
			{...props}
		/>
	)
}
