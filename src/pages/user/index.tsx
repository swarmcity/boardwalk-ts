import { IconButton } from '@swarm-city/ui-library'
import { useParams, useNavigate } from 'react-router'
import { useNetwork } from 'wagmi'
import { MarketplaceReputationContainer } from '../../containers/marketplace-reputation'
import { useProfile } from '../../services/profile'
import { useProfilePictureURL } from '../../services/profile-picture'
import { Avatar } from '../../ui/avatar'
import { getColor } from '../../ui/colors'
import { Container } from '../../ui/container'
import { Typography } from '../../ui/typography'
import { useMarketplaceListSync } from '../marketplaces/services/marketplace-list'

export function User() {
	const navigate = useNavigate()
	const { id } = useParams<string>()
	if (!id) {
		// FIXME: add some error boundaries because this could crash the app
		throw new Error('no id')
	}
	const { profile, loading } = useProfile(id)

	const avatar = useProfilePictureURL(profile?.pictureHash)
	const marketplaces = useMarketplaceListSync()

	// Explorer
	const { chain } = useNetwork()
	const explorer = chain?.blockExplorers?.default.url

	if (loading)
		return (
			<div
				style={{
					backgroundColor: getColor('grey1'),
					minHeight: '100vh',
					width: '100vw',
					overflowX: 'hidden',
				}}
			>
				<Container>
					<div
						style={{
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							padding: 50,
						}}
					>
						<Typography>Loading...</Typography>
					</div>
				</Container>
			</div>
		)

	return (
		<div
			style={{
				backgroundColor: getColor('grey1'),
				minHeight: '100vh',
				width: '100vw',
				overflowX: 'hidden',
			}}
		>
			<Container>
				<div
					style={{
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						paddingLeft: 50,
						paddingRight: 50,
					}}
				>
					<div style={{ position: 'relative', width: '100%' }}>
						<div style={{ position: 'absolute', right: 15, top: 15 }}>
							<IconButton variant="close" onClick={() => navigate(-1)} />
						</div>
					</div>
					<Avatar style={{ marginTop: 96 }} avatar={avatar} />
					<Typography variant="body-bold-16" style={{ marginTop: 17 }}>
						{profile?.username}
					</Typography>
					<a href={`${explorer}/address/${id}`} target="blank">
						<Typography
							variant="small-bold-12"
							color="blue"
							style={{
								borderBottom: `2px dotted ${getColor('blue')}`,
								marginTop: 9,
							}}
						>
							show on etherscan
						</Typography>
					</a>
					<div
						style={{
							marginTop: 53,
							width: '100%',
							paddingLeft: 50,
							paddingRight: 50,
							textAlign: 'left',
							alignItems: 'flex-start',
						}}
					>
						{marketplaces &&
							Object.values(marketplaces).map((marketplace) => (
								<MarketplaceReputationContainer
									key={marketplace.address}
									marketplaceId={marketplace.address}
									marketplaceName={marketplace.name}
									userAddress={id}
									style={{
										marginTop: 15,
									}}
								/>
							))}
					</div>
				</div>
			</Container>
		</div>
	)
}
