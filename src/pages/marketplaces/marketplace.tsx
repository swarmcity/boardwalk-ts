import { Link, useParams } from 'react-router-dom'
import { useWaku } from '../../hooks/use-waku'

// Routes
import { MARKETPLACE_ADD } from '../../routes'
import { useMarketplaceItems } from './services/marketplace-items'

const hashtag = {
	name: 'Settler',
	items: [
		{
			name: "A meatball sub from Fred's, NY",
			price: 5,
			date: new Date(),
			seeker: {
				name: 'Harry Humble',
				reputation: 4,
			},
		},
		{
			name: 'Dogwalker @ Paris today - 15:00',
			price: 12,
			date: new Date(),
			seeker: {
				name: 'Sally Singer',
				reputation: 1,
			},
		},
		{
			name: 'Looking for a ride from downtown LA (Grand - 9th av) to LAX',
			price: 5,
			date: new Date(),
			seeker: {
				name: 'Frank',
				reputation: 4,
			},
		},
		{
			name: '1/2 pound roasted Coffee beans',
			price: 3,
			date: new Date(),
			seeker: {
				name: 'Michelle',
				reputation: 420,
			},
		},
	],
}

export const Marketplace = () => {
	const { id } = useParams<string>()
	if (!id) {
		throw new Error('no id')
	}

	const { waku } = useWaku()
	const { loading, waiting, items } = useMarketplaceItems(waku, id)

	if (waiting) {
		return <p>Waiting for Waku</p>
	}

	return (
		<div>
			{loading && <p>Loading</p>}
			<h2>{hashtag.name}</h2>
			<Link to={MARKETPLACE_ADD(id)}>Add</Link>
			<div>
				{items.map((item, index) => (
					<div key={index}>
						<h3>{item.metadata.description}</h3>
						<span>{new Date(item.timestamp * 1000).toISOString()}</span>
						<p>
							{item.owner} - {item.seekerRep.toString()} SWMR
						</p>
						<span>{item.price.toString()} DAI</span>
					</div>
				))}
			</div>
		</div>
	)
}
