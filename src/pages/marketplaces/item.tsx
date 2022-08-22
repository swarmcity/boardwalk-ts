import { formatUnits } from '@ethersproject/units'
import { BigNumber } from 'ethers'
import { useMemo } from 'react'
import { useParams } from 'react-router'

// Hooks
import { useWaku } from '../../hooks/use-waku'

// Services
import { useMarketplaceTokenDecimals } from './services/marketplace'
import { useMarketplaceItems } from './services/marketplace-items'

export const MarketplaceItem = () => {
	const { id, item: itemIdString } = useParams<{ id: string; item: string }>()
	if (!id || !itemIdString) {
		throw new Error('no id or item')
	}

	const itemId = BigNumber.from(itemIdString)

	const { waku } = useWaku()
	const { decimals } = useMarketplaceTokenDecimals(id)

	// TODO: Replace this with a function that only fetches the appropriate item
	const { loading, items, lastUpdate } = useMarketplaceItems(waku, id)
	const item = useMemo(() => {
		return items.find(({ id }) => id.eq(itemId))
	}, [lastUpdate])

	if (!item) {
		if (loading) {
			return <p>Loading...</p>
		}

		return <p>Item not found...</p>
	}

	return (
		<div>
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
		</div>
	)
}
