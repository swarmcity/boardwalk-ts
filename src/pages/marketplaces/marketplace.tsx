import { Link, useParams } from 'react-router-dom'

// Routes
import { MARKETPLACE_ADD } from '../../routes'

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

	return (
		<div>
			<h2>{hashtag.name}</h2>
			<Link to={MARKETPLACE_ADD(id)}>Add</Link>
			<div>
				{hashtag.items.map((item, index) => (
					<div key={index}>
						<h3>{item.name}</h3>
						<span>{item.date.toISOString()}</span>
						<p>
							{item.seeker.name} - {item.seeker.reputation} SWMR
						</p>
						<span>{item.price} DAI</span>
					</div>
				))}
			</div>
		</div>
	)
}
