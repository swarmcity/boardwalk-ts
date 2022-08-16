import { useNavigate } from 'react-router-dom'

// Routes and config
import { MARKETPLACE } from '../../routes'

// Services
import { useMarketplaceListSync } from './services/marketplace-list'

export const MarketplaceList = () => {
	const navigate = useNavigate()
	const marketplaces = useMarketplaceListSync()

	// TODO: Difference between loading and "empty marketplace"
	if (!marketplaces) {
		return <p>Loading...</p>
	}

	return (
		<div>
			{Object.values(marketplaces)
				.filter(({ deleted }) => !deleted)
				.map(({ address, name }) => (
					<div key={address} onClick={() => navigate(MARKETPLACE(address))}>
						<h2>{name}</h2>
						{/* TODO: List of completed deals */}
						<p>? deals completed</p>
					</div>
				))}
		</div>
	)
}
