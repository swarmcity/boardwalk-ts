import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconButton, Input } from '@swarm-city/ui-library'

import warningBlue from '../../assets/imgs/warningBlue.svg?url'
import { ACCOUNT_CREATED } from '../../routes'
import { Wallet } from 'ethers'
import { UserCreateStop } from '../../components/modals/user-create-stop'
import { useStore } from '../../store'
import { getColor } from '../../ui/colors'
import { Container } from '../../ui/container'
import { Typography } from '../../ui/typography'

export const ChoosePassword = () => {
	const [showPrompt, setShowPrompt] = useState(true)
	const [profile, setProfile] = useStore.profile()
	const [loading, setLoading] = useState(false)
	const [password, setPassword] = useState<string>('')
	const [password2, setPassword2] = useState<string>('')
	const navigate = useNavigate()

	const onClick = () => {
		setLoading(true)
		const wallet = Wallet.createRandom()
		wallet.encrypt(password).then((encryptedWallet) => {
			setProfile({
				...profile,
				encryptedWallet,
				address: wallet.address,
				lastUpdate: new Date(),
				chatBaseKey: crypto.getRandomValues(new Uint8Array(32)),
			})
			setLoading(false)
			navigate(ACCOUNT_CREATED)
		})
	}

	if (showPrompt)
		return (
			<div
				style={{
					width: '100vw',
					minHeight: '100vh',
					backgroundColor: getColor('grey1'),
				}}
			>
				<Container>
					<UserCreateStop />
					<main
						style={{
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							marginLeft: 50,
							marginRight: 50,
							marginTop: 130,
							textAlign: 'center',
						}}
					>
						<Typography variant="header-35" color="grey2-light-text">
							Choose a password.
						</Typography>

						<div
							style={{
								backgroundColor: getColor('white'),
								marginTop: 77,
							}}
						>
							<div style={{ position: 'relative', width: '100%' }}>
								<div
									style={{
										position: 'absolute',
										top: -25,
										width: '100%',
										display: 'flex',
										flexDirection: 'row',
										alignItems: 'center',
										justifyContent: 'center',
									}}
								>
									<img src={warningBlue} />
								</div>
							</div>
							<div
								style={{
									backgroundColor: getColor('white'),
									paddingLeft: 22,
									paddingRight: 22,
									paddingTop: 46,
									paddingBottom: 34,
									display: 'flex',
									flexDirection: 'column',
									alignItems: 'center',
									textAlign: 'center',
								}}
							>
								<Typography variant="body-bold-16" color="grey4">
									There is no password recovery available in Swarm City.
								</Typography>
								<Typography
									variant="body-bold-16"
									color="grey4"
									style={{ marginTop: 20 }}
								>
									Choose your password with care.
								</Typography>
							</div>
						</div>
						<IconButton
							variant="conflictNext"
							onClick={() => setShowPrompt(false)}
							style={{ marginTop: 50 }}
						/>
					</main>
				</Container>
			</div>
		)
	return (
		<div
			style={{
				width: '100vw',
				minHeight: '100vh',
				backgroundColor: getColor('grey1'),
			}}
		>
			<Container>
				<UserCreateStop />
				<main
					style={{
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						marginLeft: 50,
						marginRight: 50,
						marginTop: 130,
						textAlign: 'center',
					}}
				>
					<Typography variant="header-35" color="grey2-light-text">
						Choose a password.
					</Typography>
					<form>
						<div style={{ marginTop: 40 }}>
							<Input
								id="password"
								type="password"
								onChange={(e) => setPassword(e.currentTarget.value)}
								autoFocus
							>
								password
							</Input>
						</div>
						<div style={{ marginTop: 40 }}>
							<Input
								id="passwordConfirm"
								type="password"
								onChange={(e) => setPassword2(e.currentTarget.value)}
							>
								confirm password
							</Input>
						</div>
					</form>
					<div
						style={{
							height: '100px',
							width: '100%',
							display: 'flex',
							flexDirection: 'column',
							justifyContent: 'center',
							alignItems: 'center',
						}}
					>
						{loading && (
							<Typography variant="body-bold-16">Encrypting...</Typography>
						)}
						{!loading && password2 && password !== password2 && (
							<Typography color={'red-text'} variant="body-bold-16">
								password mismatch
							</Typography>
						)}
					</div>
					<IconButton
						variant="conflictNext"
						disabled={!password || password !== password2 || loading}
						onClick={onClick}
					/>
				</main>
			</Container>
		</div>
	)
}
