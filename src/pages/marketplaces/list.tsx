import { useNavigate } from 'react-router-dom'
import { MarketplaceItem, FullscreenLoading } from '@swarm-city/ui-library'

// Routes and config
import { MARKETPLACE } from '../../routes'

// Services
import { useMarketplaceListSync } from './services/marketplace-list'

export const MarketplaceList = () => {
	const navigate = useNavigate()
	const marketplaces = useMarketplaceListSync()

	// TODO: Difference between loading and "empty marketplace"
	if (!marketplaces) {
		return <FullscreenLoading />
	}

	return (
		<div>
			{Object.values(marketplaces)
				.filter(({ deleted }) => !deleted)
				.map(({ address, name }) => (
					<MarketplaceItem
						key={address}
						onClick={() => navigate(MARKETPLACE(address))}
						title={name}
						completedDeals={0 /* TODO: fetch completed deals */}
					/>
				))}
		</div>
	)
}
