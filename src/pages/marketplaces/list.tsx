import { navigate } from '@reach/router'

// Types
import type { RouteComponentProps } from '@reach/router'

// Routes
import { MARKETPLACE } from '../../routes'

const hashtags = [
	{ id: '1', name: 'Settler', deals: 40 },
	{ id: '2', name: 'ScCommShare', deals: 50 },
	{ id: '3', name: 'ScSwag', deals: 20 },
]

type MarketplaceListProps = RouteComponentProps

export const MarketplaceList = (_: MarketplaceListProps) => {
	return (
		<div>
			{hashtags.map(({ id, name, deals }) => (
				<div key={id} onClick={() => navigate(MARKETPLACE(id))}>
					<h2>{name}</h2>
					<p>{deals} deals completed</p>
				</div>
			))}
		</div>
	)
}
