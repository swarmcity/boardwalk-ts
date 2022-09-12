import { useMemo } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useAccount } from 'wagmi'
import { MarketplaceListingItem, IconButton } from '@swarm-city/ui-library'

// Hooks
import { useWakuContext } from '../../hooks/use-waku'

// Routes
import { MARKETPLACE_ADD } from '../../routes'

// Services
import {
	useMarketplaceName,
	useMarketplaceTokenDecimals,
} from './services/marketplace'
import { Item, Status, useMarketplaceItems } from './services/marketplace-items'
import { BigNumber } from 'ethers'
import { Container } from '../../ui/container'
import { Typography } from '../../ui/typography'

type DisplayItemsProps = {
	marketplace: string
	items: Item[]
	decimals: number | undefined
}

export function formatMoney(amount: bigint | BigNumber, decimals = 18) {
	const base =
		typeof amount === 'bigint' ? Number(amount) : Number(amount.toBigInt())
	return base / 10 ** decimals
}

const DisplayItems = ({ marketplace, items, decimals }: DisplayItemsProps) => {
	const navigate = useNavigate()
	return (
		<>
			{items
				.filter(({ status }) => status === Status.Open)
				.map((item, index) => (
					<div
						key={index}
						style={{
							backgroundColor: 'white',
							marginBottom: 6,
							padding: 21,
							cursor: 'pointer',
						}}
						onClick={() =>
							navigate(`/marketplace/${marketplace}/item/${item.id.toString()}`)
						}
					>
						<MarketplaceListingItem
							title={item.metadata.description}
							repliesCount={0}
							date={new Date(item.timestamp * 1000)}
							amount={formatMoney(item.price)}
							user={{
								// TODO: get the owner name and avatar
								name: item.owner.substring(0, 10),
								reputation: item.seekerRep.toNumber(),
							}}
						/>
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
	const { waku } = useWakuContext()
	const { loading, waiting, items, lastUpdate } = useMarketplaceItems(waku, id)
	const { decimals } = useMarketplaceTokenDecimals(id)
	const navigate = useNavigate()
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
		return (
			<Container>
				<Typography
					variant="h5"
					color="grey4"
					style={{
						marginLeft: 40,
						marginRight: 40,
					}}
				>
					Connecting to waku...
				</Typography>
			</Container>
		)
	}

	return (
		<>
			<div style={{ position: 'fixed', right: 50, zIndex: 50, bottom: 60 }}>
				<IconButton
					variant="requestStart"
					onClick={() => navigate(MARKETPLACE_ADD(id))}
				/>
			</div>
			<Container>
				<Typography
					variant="h5"
					color="grey4"
					style={{
						marginLeft: 40,
						marginRight: 40,
					}}
				>
					{name ?? 'Loading...'}
				</Typography>
			</Container>
			<Container>
				{loading ? (
					<Typography>Fetching your marketplace data...</Typography>
				) : (
					<div style={{ flexGrow: 1, marginLeft: 10, marginRight: 10 }}>
						<div style={{ marginTop: 22, marginBottom: 32 }}>
							<DisplayItems marketplace={id} items={own} decimals={decimals} />
						</div>

						<div style={{ marginTop: 22 }}>
							<DisplayItems
								marketplace={id}
								items={other}
								decimals={decimals}
							/>
						</div>
					</div>
				)}
			</Container>
		</>
	)
}
