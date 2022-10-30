import { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAccount } from 'wagmi'
import { IconButton } from '@swarm-city/ui-library'

// Routes
import { LOGIN, MARKETPLACES, MARKETPLACE_ADD } from '../../routes'

// Services
import {
	useMarketplaceName,
	useMarketplaceTokenDecimals,
	useMarketplaceTokenName,
} from './services/marketplace'
import { Item, useMarketplaceItems } from './services/marketplace-items'

// UI
import { Container } from '../../ui/container'
import { Typography } from '../../ui/typography'
import { Request } from '../../ui/components/request'

// Services
import { useProfile } from '../../services/profile'
import { useProfilePictureURL } from '../../services/profile-picture'

// Lib
import { tokenToDecimals } from '../../ui/utils'
import { getStatus } from '../../types'
import { User } from '../../ui/types'
import { UserAccount } from './user-account'
import { Back } from '../../ui/icons/back'
import { getColor } from '../../ui/colors'

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
	const tokenName = useMarketplaceTokenName(marketplace)

	// Profile
	const { profile } = useProfile(item.owner)
	const avatar = useProfilePictureURL(profile?.pictureHash)

	const providerProfile = useProfile(item?.provider)
	const providerAvatar = useProfilePictureURL(
		providerProfile.profile?.pictureHash
	)
	const provider: User | undefined = item.provider
		? {
				address: item.provider,
				reputation: 0n, // not used
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
				date={new Date(item.timestamp.toNumber() * 1000)}
				amount={tokenToDecimals(item.price, decimals)}
				status={getStatus(item.status)}
				onClickUser={() => navigate(`/user/${item.owner}`)}
				isMyListing={item.owner === address}
				isMyDeal={
					(address && item.owner === address) || provider?.address === address
				}
				seeker={{
					address: item.owner,
					name: profile?.username,
					reputation: item.seekerRep.toBigInt() ?? 0n,
					avatar,
				}}
				provider={provider}
				tokenName={tokenName}
			/>
		</div>
	)
}

const DisplayItems = ({ marketplace, items, decimals }: DisplayItemsProps) => {
	return (
		<>
			{items
				.sort((a, b) => b.timestamp.sub(a.timestamp).toNumber())
				.map((item) => (
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

	const goBack = (
		<div style={{ cursor: 'pointer' }} onClick={() => navigate(MARKETPLACES)}>
			<Back size={18} />
		</div>
	)

	if (waiting) {
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
				<UserAccount>{goBack}</UserAccount>
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
			</div>
		)
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
			<UserAccount>{goBack}</UserAccount>
			<div style={{ position: 'fixed', right: 50, zIndex: 50, bottom: 60 }}>
				<IconButton
					variant="requestStart"
					onClick={() => navigate(address ? MARKETPLACE_ADD(id) : LOGIN)}
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
			<div
				style={{
					flexGrow: 1,
					overflowY: 'auto',
					overflowX: 'hidden',
					marginTop: 22,
				}}
			>
				<Container>
					<div style={{ flexGrow: 1, marginLeft: 10, marginRight: 10 }}>
						{loading ? (
							<div style={{ paddingLeft: 30, marginBottom: 32 }}>
								<Typography>Fetching your marketplace data...</Typography>
							</div>
						) : (
							<>
								{own.length > 0 && (
									<div style={{ marginBottom: 32 }}>
										<DisplayItems
											marketplace={id}
											items={own}
											decimals={decimals}
										/>
									</div>
								)}

								{other.length > 0 && (
									<div style={{ marginBottom: 32 }}>
										<DisplayItems
											marketplace={id}
											items={other}
											decimals={decimals}
										/>
									</div>
								)}
							</>
						)}
					</div>
				</Container>
			</div>
		</div>
	)
}
