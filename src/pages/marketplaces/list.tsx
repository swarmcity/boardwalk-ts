import { useNavigate } from 'react-router-dom'
import { MarketplaceItem, FullscreenLoading } from '@swarm-city/ui-library'

// Routes and config
import { MARKETPLACE } from '../../routes'

// Services
import {
	MarketplaceListItem,
	useMarketplaceListSync,
} from './services/marketplace-list'
import { useMarketplaceDealCount } from './services/marketplace'

export const Item = ({ address, name }: MarketplaceListItem) => {
	const navigate = useNavigate()
	const deals = useMarketplaceDealCount(address)

	return (
		<MarketplaceItem
			onClick={() => navigate(MARKETPLACE(address))}
			title={name}
			completedDeals={deals ? Number(deals) : 0}
		/>
	)
}

export const MarketplaceList = () => {
	const marketplaces = useMarketplaceListSync()

	// TODO: Difference between loading and "empty marketplace"
	if (!marketplaces) {
		return <FullscreenLoading />
	}

	return (
		<div>
			{Object.values(marketplaces)
				.filter(({ deleted }) => !deleted)
				.map((marketplace) => (
					<Item key={marketplace.address} {...marketplace} />
				))}
		</div>
	)
}
