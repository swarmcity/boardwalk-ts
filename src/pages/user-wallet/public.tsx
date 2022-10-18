import { QRCodeSVG } from 'qrcode.react'
import { useNavigate } from 'react-router-dom'
import { IconButton } from '@swarm-city/ui-library'

// Components
import { CopyLink } from '../../components/copy-link/copy-link'
import { Redirect } from '../../components/redirect'
import { getColor } from '../../ui/colors'
import { Container } from '../../ui/container'
import { Typography } from '../../ui/typography'

// Store and routes
import { useStore } from '../../store'
import { LOGIN } from '../../routes'

export const AccountPublicWallet = () => {
	const [profile] = useStore.profile()
	const navigate = useNavigate()

	if (!profile?.address) {
		return <Redirect to={LOGIN} />
	}

	return (
		<div
			style={{
				width: '100vw',
				minHeight: '100vh',
				backgroundColor: getColor('grey1'),
			}}
		>
			<Container>
				<div style={{ position: 'relative', width: '100%' }}>
					<div style={{ position: 'absolute', right: 15, top: 15 }}>
						<IconButton variant="close" onClick={() => navigate(-1)} />
					</div>
				</div>
				<div
					style={{
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						textAlign: 'center',
						marginLeft: 50,
						marginRight: 50,
					}}
				>
					<div style={{ marginTop: 120 }}>
						<QRCodeSVG value={profile.address} bgColor="none" />
					</div>
					<Typography
						variant="small-light-12"
						color="grey4"
						style={{ marginTop: 35 }}
					>
						Your address:
					</Typography>
					<Typography
						variant="body-extra-light-20"
						color="grey4"
						style={{
							overflowWrap: 'anywhere',
							marginTop: 10,
						}}
					>
						{profile.address}
						<CopyLink
							text={profile?.address ?? ''}
							style={{
								display: 'inline-block',
								overflowWrap: 'normal',
								marginLeft: 5,
							}}
						/>
					</Typography>
				</div>
			</Container>
		</div>
	)
}
