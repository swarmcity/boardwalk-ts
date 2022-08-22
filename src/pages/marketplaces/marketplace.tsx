import { formatUnits } from '@ethersproject/units'
import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAccount } from 'wagmi'
import { useWaku } from '../../hooks/use-waku'

// Routes
import { MARKETPLACE_ADD } from '../../routes'
import { useMarketplaceTokenDecimals } from './services/marketplace'
import { Item, useMarketplaceItems } from './services/marketplace-items'

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

type DisplayItemsProps = {
	items: Item[]
	decimals: number | undefined
}

const DisplayItems = ({ items, decimals }: DisplayItemsProps) => {
	return (
		<>
			{items.map((item, index) => (
				<div key={index}>
					<h3>{item.metadata.description}</h3>
					<span>{new Date(item.timestamp * 1000).toISOString()}</span>
					<p>
						{item.owner} - {item.seekerRep.toString()} SWMR
					</p>
					<span>
						{decimals !== undefined
							? 'Loading...'
							: `${formatUnits(item.price, decimals)} DAI`}
					</span>
				</div>
			))}
		</>
	)
}

export const Marketplace = () => {
	const { id } = useParams<string>()
	if (!id) {
		throw new Error('no id')
	}

	const { address } = useAccount()
	const { waku } = useWaku()
	const { loading, waiting, items, lastUpdate } = useMarketplaceItems(waku, id)
	const { decimals } = useMarketplaceTokenDecimals(id)

	// Filter out the user's items from the other ones
	const [own, other] = useMemo(
		() =>
			items.reduce(
				([own, other]: Item[][], item) => {
					return item.owner === address
						? [[...own, item], other]
						: [own, [...other, item]]
				},
				[[], []] as Item[][]
			),
		[lastUpdate]
	)

	if (waiting) {
		return <p>Waiting for Waku</p>
	}

	return (
		<div>
			{loading && <p>Loading</p>}
			<h2>{hashtag.name}</h2>
			<Link to={MARKETPLACE_ADD(id)}>Add</Link>
			<div>
				<h2 style={{ textDecoration: 'underline' }}>My items</h2>
				<DisplayItems items={own} decimals={decimals} />
			</div>

			<div>
				<h2 style={{ textDecoration: 'underline' }}>Other items</h2>
				<DisplayItems items={other} decimals={decimals} />
			</div>
		</div>
	)
}
