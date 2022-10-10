import { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAccount } from 'wagmi'
import { IconButton } from '@swarm-city/ui-library'

// Routes
import { MARKETPLACE_ADD } from '../../routes'

// Services
import {
	useMarketplaceItem,
	useMarketplaceName,
	useMarketplaceTokenDecimals,
} from './services/marketplace'
import { Item, useMarketplaceItems } from './services/marketplace-items'

// UI
import { Container } from '../../ui/container'
import { Typography } from '../../ui/typography'
import { Request } from '../../ui/components/request'

// Services
import { useProfile } from '../../services/profile'
import {
	useProfilePicture,
	useProfilePictureURL,
} from '../../services/profile-picture'

// Lib
import { formatMoney } from '../../ui/utils'
import { getStatus } from '../../types'
import { bufferToHex } from '../../lib/tools'
import { User } from '../../ui/types'

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

	const chainItem = useMarketplaceItem(marketplace, item.id.toBigInt())

	const providerProfile = useProfile(chainItem.item?.providerAddress)
	const providerPicture = useProfilePicture(
		providerProfile.profile?.pictureHash
			? bufferToHex(providerProfile.profile.pictureHash)
			: ''
	)
	const providerAvatar = useMemo(() => {
		if (providerPicture.picture) {
			const blob = new Blob([providerPicture.picture.data], {
				type: providerPicture.picture?.type,
			})
			return URL.createObjectURL(blob)
		}
	}, [providerPicture.picture])
	const provider: User | undefined = chainItem.item?.providerAddress
		? {
				address: chainItem.item.providerAddress,
				reputation: chainItem.item?.providerRep ?? 0n,
				name: providerProfile.profile?.username,
				avatar: providerAvatar,
		  }
		: undefined

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
			<Request
				title={item.metadata.description}
				repliesCount={0}
				date={new Date(item.timestamp * 1000)}
				amount={formatMoney(item.price, decimals)}
				status={getStatus(item.status)}
				onClickUser={() => navigate(`/user/${item.owner}`)}
				isMyListing={item.owner === address}
				seeker={{
					address: item.owner,
					name: profile?.username,
					reputation: item.seekerRep.toBigInt(),
					avatar,
				}}
				provider={provider}
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
