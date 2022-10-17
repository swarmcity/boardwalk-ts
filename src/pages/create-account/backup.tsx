import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

// Components
import { UserCreateStop } from '../../components/modals/user-create-stop'

// Assets
import warningBlue from '../../assets/imgs/warningBlue.svg?url'

// Store and routes
import { MARKETPLACES } from '../../routes'
import { useStore } from '../../store'
import { Container } from '../../ui/container'
import { Button, IconButton } from '@swarm-city/ui-library'
import { Typography } from '../../ui/typography'
import { getColor } from '../../ui/colors'

export const Backup = () => {
	const [showPrompt, setShowPrompt] = useState(true)
	const [profile] = useStore.profile()
	const navigate = useNavigate()
	const blob = useMemo(
		() =>
			new Blob([JSON.stringify(profile)], {
				type: 'application/json',
			}),
		[profile]
	)

	const downloadFile = useCallback(() => {
		const elem = window.document.createElement('a')
		elem.href = window.URL.createObjectURL(blob)
		elem.download = 'swarm-city-wallet.json'
		document.body.appendChild(elem)
		elem.click()
		document.body.removeChild(elem)
	}, [blob])

	useEffect(() => {
		if (!showPrompt) {
			downloadFile()
		}
	}, [showPrompt, downloadFile])

	if (showPrompt) {
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
							Make a backup.
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
									There are no central servers on which accounts are stored.
								</Typography>
								<Typography
									variant="body-bold-16"
									color="grey4"
									style={{ marginTop: 20 }}
								>
									This means you are responsible for your own account at all
									times.
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
					<Typography
						variant="header-35"
						color="grey2-light-text"
						style={{ marginTop: 118 }}
					>
						Save the file in a safe location.
					</Typography>
					<Typography
						variant="small-light-12"
						color="grey4"
						style={{ marginTop: 40 }}
					>
						A download should begin. Save the file somehwere safe. With this
						file you will always be able to get access to the funds on your
						wallet.
					</Typography>
					<Typography
						variant="small-light-12"
						color="grey4"
						style={{ marginTop: 20 }}
					>
						The private key of your account is encrypted with your password.
					</Typography>

					<Typography
						variant="small-bold-12"
						color="blue"
						onClick={() => downloadFile()}
						style={{
							borderBottom: `2px dotted ${getColor('blue')}`,
							marginTop: 50,
						}}
					>
						force download
					</Typography>
					<Button
						size="large"
						color="blue-light"
						bg
						onClick={() => navigate(MARKETPLACES)}
						style={{ marginTop: 90 }}
					>
						enter swarm.city
					</Button>
				</main>
			</Container>
		</div>
	)
}
