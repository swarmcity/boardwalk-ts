import { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAccount } from 'wagmi'
import { MarketplaceListingItem, IconButton } from '@swarm-city/ui-library'

// Routes
import { MARKETPLACE_ADD } from '../../routes'

// Services
import {
	useMarketplaceName,
	useMarketplaceTokenDecimals,
} from './services/marketplace'
import { Item, Status, useMarketplaceItems } from './services/marketplace-items'

// UI
import { Container } from '../../ui/container'
import { Typography } from '../../ui/typography'

// Services
import { useProfile } from '../../services/profile'
import { useProfilePictureURL } from '../../services/profile-picture'

// Lib
import { formatFrom } from '../../lib/tools'
import { formatMoney } from '../../ui/utils'

type DisplayItemProps = {
	marketplace: string
	item: Item
	decimals: number | undefined
}

type DisplayItemsProps = {
	marketplace: string
	items: Item[]
	decimals: number | undefined
}

const DisplayItem = ({ item, decimals, marketplace }: DisplayItemProps) => {
	const navigate = useNavigate()
	const { address } = useAccount()

	// Profile
	const { profile } = useProfile(item.owner)
	const avatar = useProfilePictureURL(profile?.pictureHash)

	return (
		<div
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
				title={item.status + ' - ' + item.metadata.description}
				repliesCount={0}
				date={new Date(item.timestamp * 1000)}
				amount={formatMoney(item.price, decimals)}
				user={{
					name: formatFrom(item.owner, profile?.username),
					reputation: item.seekerRep.toNumber(),
					myself: item.owner === address,
					avatar,
				}}
			/>
		</div>
	)
}

const DisplayItems = ({ marketplace, items, decimals }: DisplayItemsProps) => {
	return (
		<>
			{items.map((item) => (
				<DisplayItem
					key={item.id.toString()}
					marketplace={marketplace}
					decimals={decimals}
					item={item}
				/>
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
	const { loading, waiting, items, lastUpdate } = useMarketplaceItems(id)
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
					variant="header-28"
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
					variant="header-28"
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
				<div style={{ flexGrow: 1, marginLeft: 10, marginRight: 10 }}>
					{loading ? (
						<Typography>Fetching your marketplace data...</Typography>
					) : (
						<>
							<div style={{ marginTop: 22, marginBottom: 32 }}>
								<DisplayItems
									marketplace={id}
									items={own}
									decimals={decimals}
								/>
							</div>

							<div style={{ marginTop: 22 }}>
								<DisplayItems
									marketplace={id}
									items={other}
									decimals={decimals}
								/>
							</div>
						</>
					)}
				</div>
			</Container>
		</>
	)
}
