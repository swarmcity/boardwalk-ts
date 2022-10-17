import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { useNavigate } from 'react-router-dom'
import { Button, IconButton } from '@swarm-city/ui-library'

// Components
import { PasswordModal } from '../../components/modals/password/password'
import { CopyLink } from '../../components/copy-link/copy-link'
import { Redirect } from '../../components/redirect'

// Store and routes
import { useStore } from '../../store'
import { LOGIN, ACCOUNT_WALLET } from '../../routes'
import { getColor } from '../../ui/colors'
import { Container } from '../../ui/container'
import { Typography } from '../../ui/typography'

export const AccountPublicWallet = () => {
	const [showQR, setShowQR] = useState(false)
	const [showPassword, setShowPassword] = useState(false)
	const [privateKey, setPrivateKey] = useState<string>()
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
			<PasswordModal
				show={showPassword}
				onClose={() => setShowPassword(false)}
				onSuccess={(wallet) => {
					setPrivateKey(wallet.privateKey)
					setShowPassword(false)
				}}
			/>
			<Container>
				<div style={{ position: 'relative', width: '100%' }}>
					<div style={{ position: 'absolute', right: 15, top: 15 }}>
						<IconButton
							variant="close"
							onClick={() => navigate(ACCOUNT_WALLET)}
						/>
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
					<Typography
						variant="small-light-12"
						color="grey4"
						style={{ marginTop: 120 }}
					>
						Your public key:
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
					</Typography>
					<div
						className="links"
						style={{
							display: 'flex',
							flexDirection: 'row',
							alignItems: 'center',
							marginTop: 15,
						}}
					>
						<CopyLink text={profile?.address ?? ''} className="link">
							copy public key
						</CopyLink>
						<div style={{ marginLeft: 20 }}>
							<Typography
								style={{
									cursor: 'pointer',
									borderBottom: `2px dotted ${getColor('grey3')}`,
								}}
								variant="small-bold-12"
								color="grey3"
								onClick={() => setShowQR(!showQR)}
							>
								{showQR ? 'hide' : 'show'} QR code
							</Typography>
						</div>
					</div>
					{showQR && (
						<div style={{ marginTop: 46 }}>
							<QRCodeSVG value={profile.address} bgColor="none" />
						</div>
					)}
				</div>
			</Container>
			<div
				style={{
					width: '100%',
					height: 0,
					borderBottom: `1px solid ${getColor('grey2')}`,
					marginTop: 50,
					marginBottom: 50,
				}}
			/>
			<Container>
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
					<Typography variant="small-light-12" color="grey4">
						Your private key
					</Typography>
					<Typography
						variant="body-light-16"
						color="grey4"
						style={{ marginTop: 10 }}
					>
						Be careful in displaying your private key. It's the only thing
						needed to steal your funds.
					</Typography>
					<div className="container">
						{privateKey ? (
							<div
								style={{
									marginTop: 56,
									display: 'flex',
									flexDirection: 'column',
									alignItems: 'center',
								}}
							>
								<Typography
									variant="body-extra-light-20"
									color="grey4"
									style={{
										overflowWrap: 'anywhere',
									}}
								>
									{privateKey}
								</Typography>
								<div
									className="links"
									style={{
										display: 'flex',
										flexDirection: 'row',
										alignItems: 'center',
										marginTop: 15,
									}}
								>
									<CopyLink text={privateKey}>copy private key</CopyLink>
									<div style={{ marginLeft: 20 }}>
										<Typography
											style={{
												cursor: 'pointer',
												borderBottom: `2px dotted ${getColor('grey3')}`,
											}}
											variant="small-bold-12"
											color="grey3"
											onClick={() => setPrivateKey('')}
										>
											hide private key
										</Typography>
									</div>
								</div>
							</div>
						) : (
							<Button
								size="large"
								onClick={() => setShowPassword(true)}
								style={{ marginTop: 35 }}
							>
								show private key
							</Button>
						)}
					</div>
				</div>
			</Container>
		</div>
	)
}
