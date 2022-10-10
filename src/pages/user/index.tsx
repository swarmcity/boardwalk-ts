import { IconButton } from '@swarm-city/ui-library'
import { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router'
import { bufferToHex } from '../../lib/tools'
import { useProfile } from '../../services/profile'
import { useProfilePicture } from '../../services/profile-picture'
import { Avatar } from '../../ui/avatar'
import { getColor } from '../../ui/colors'
import { Container } from '../../ui/container'
import { Typography } from '../../ui/typography'

interface Marketplace {
	name: string
	seekerRep: number
	providerRep: number
}

const marketplaces: Marketplace[] = [
	{
		name: 'Settler',
		seekerRep: 1,
		providerRep: 0,
	},
	{
		name: 'ScCommShare',
		seekerRep: 9,
		providerRep: 12,
	},
	{
		name: 'SwarmCitySwag',
		seekerRep: 4,
		providerRep: 2,
	},
]

export function User() {
	const navigate = useNavigate()
	const { id } = useParams<string>()
	if (!id) {
		throw new Error('no id')
	}
	const { profile, waiting, loading } = useProfile(id)

	const { picture } = useProfilePicture(
		profile?.pictureHash ? bufferToHex(profile.pictureHash) : ''
	)

	const avatar = useMemo(() => {
		if (picture) {
			const blob = new Blob([picture.data], { type: picture?.type })
			return URL.createObjectURL(blob)
		}
	}, [picture])

	if (waiting || loading)
		return (
			<div
				style={{
					backgroundColor: getColor('grey1'),
					minHeight: '100vh',
					width: '100%',
				}}
			>
				<Container>
					<div
						style={{
							display: 'flex',
							flexDirection: 'column',
							width: '100%',
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
				width: '100%',
			}}
		>
			<Container>
				<div
					style={{
						display: 'flex',
						flexDirection: 'column',
						width: '100%',
						alignItems: 'center',
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
					<Typography
						variant="small-bold-12"
						color="blue"
						style={{
							borderBottom: `2px dashed ${getColor('blue')}`,
							marginTop: 9,
						}}
					>
						<a href={`https://goerli.etherscan.io/address/${id}`}>
							show on ethplorer
						</a>
					</Typography>
					<div
						style={{
							marginTop: 53,
							width: '100%',
							paddingLeft: 50,
							paddingRight: 50,
						}}
					>
						{marketplaces.map(({ name, seekerRep, providerRep }, index) => (
							<div
								key={index}
								style={{
									display: 'flex',
									flexDirection: 'column',
									marginBottom: 20,
								}}
							>
								<Typography variant="body-bold-16" color="grey4">
									{name}
								</Typography>
								<div
									style={{
										display: 'flex',
										flexDirection: 'row',
										alignItems: 'center',
									}}
								>
									<div style={{ display: 'flex', flexDirection: 'column' }}>
										<Typography variant="body-extra-light-20" color="blue">
											{seekerRep} SWR
										</Typography>
										<Typography variant="small-light-12" color="grey3">
											as a Seeker
										</Typography>
									</div>
									<div
										style={{
											height: 32,
											width: 0,
											border: '1px dashed #BFBFBF',
											marginLeft: 15,
											marginRight: 15,
										}}
									/>
									<div style={{ display: 'flex', flexDirection: 'column' }}>
										<Typography variant="body-extra-light-20" color="blue">
											{providerRep} SWR
										</Typography>
										<Typography variant="small-light-12" color="grey3">
											as a Provider
										</Typography>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</Container>
		</div>
	)
}
