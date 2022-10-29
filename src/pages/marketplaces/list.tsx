import { useNavigate } from 'react-router-dom'
import { FullscreenLoading } from '@swarm-city/ui-library'

// Routes and config
import { HOME, MARKETPLACE } from '../../routes'

// Services
import {
	MarketplaceListItem,
	useMarketplaceListSync,
} from './services/marketplace-list'
import { useMarketplaceDealCount } from './services/marketplace'
import { UserAccount } from './user-account'
import { MarketplaceItem } from '../../ui/components/marketplace-item'

// Assets
import exit from '../../assets/imgs/exit.svg?url'
import { getColor } from '../../ui/colors'

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
	const navigate = useNavigate()

	// TODO: Difference between loading and "empty marketplace"
	if (!marketplaces) {
		return <FullscreenLoading />
	}

	return (
		<div
			style={{
				backgroundColor: getColor('grey1'),
				width: '100vw',
				height: '100vh',
				overflow: 'hidden',
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'stretch',
			}}
		>
			<UserAccount>
				<div style={{ cursor: 'pointer' }} onClick={() => navigate(HOME)}>
					<img src={exit} />
				</div>
			</UserAccount>

			<div
				style={{
					flexGrow: 1,
					overflowY: 'auto',
					overflowX: 'hidden',
				}}
			>
				{Object.values(marketplaces)
					.filter(({ deleted }) => !deleted)
					.map((marketplace) => (
						<Item key={marketplace.address} {...marketplace} />
					))}
			</div>
		</div>
	)
}
