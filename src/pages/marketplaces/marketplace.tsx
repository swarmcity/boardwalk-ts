import { formatUnits } from '@ethersproject/units'
import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAccount } from 'wagmi'
import { useWaku } from '../../hooks/use-waku'

// Routes
import { MARKETPLACE_ADD } from '../../routes'
import {
	useMarketplaceName,
	useMarketplaceTokenDecimals,
} from './services/marketplace'
import { Item, useMarketplaceItems } from './services/marketplace-items'

type DisplayItemsProps = {
	marketplace: string
	items: Item[]
	decimals: number | undefined
}

const DisplayItems = ({ marketplace, items, decimals }: DisplayItemsProps) => {
	return (
		<>
			{items.map((item, index) => (
				<Link
					to={`/marketplace/${marketplace}/item/${item.id.toString()}`}
					key={index}
				>
					<h3>{item.metadata.description}</h3>
					<span>{new Date(item.timestamp * 1000).toISOString()}</span>
					<p>
						{item.owner} - {item.seekerRep.toString()} SWMR
					</p>
					<span>
						{decimals === undefined
							? 'Loading...'
							: `${formatUnits(item.price, decimals)} DAI`}
					</span>
				</Link>
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
	const name = useMarketplaceName(id)

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
			<h2>{name}</h2>
			<Link to={MARKETPLACE_ADD(id)}>Add</Link>
			<div>
				<h2 style={{ textDecoration: 'underline' }}>My items</h2>
				<DisplayItems marketplace={id} items={own} decimals={decimals} />
			</div>

			<div>
				<h2 style={{ textDecoration: 'underline' }}>Other items</h2>
				<DisplayItems marketplace={id} items={other} decimals={decimals} />
			</div>
		</div>
	)
}
