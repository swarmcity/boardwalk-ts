import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Button, IconButton } from '@swarm-city/ui-library'

// Store and routes
import { useStore } from '../store'
import { MARKETPLACES } from '../routes'

// Components
import { UserCreateStop } from '../components/modals/user-create-stop'
import { getColor } from '../ui/colors'
import { Typography } from '../ui/typography'
import { Container } from '../ui/container'
import { Avatar } from '../ui/avatar'

// Types
import type { Profile } from '../types'
import type { ChangeEvent } from 'react'

export const AccountRestore = () => {
	const [profile, setProfile] = useStore.profile()
	const [restoredProfile, setRestoredProfile] = useState<Profile | null>(null)
	const [confirmed, setConfirmed] = useState(false)
	const navigate = useNavigate()

	const onFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
		if (!(event.target instanceof HTMLInputElement)) {
			return
		}

		if (event.target.files?.length) {
			const file = event.target.files[0]
			setRestoredProfile(JSON.parse(await file.text()))
		}
	}

	if (!confirmed && !restoredProfile)
		return (
			<div
				style={{
					width: '100vw',
					minHeight: '100vh',
					backgroundColor: getColor('grey1'),
				}}
			>
				<Container>
					<UserCreateStop restoring />
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
							Upload and unlock your account file.
						</Typography>
						<label
							className="btn btn-light"
							style={{
								fontFamily: 'Montserrat',
								background: getColor('white'),
								boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.25)',
								borderRadius: 2,
								padding: 30,
								fontSize: 18,
								fontWeight: 700,
								textAlign: 'center',
								color: getColor('blue'),
								border: 0,
								minWidth: 272,
								pointerEvents: 'all',
								cursor: 'pointer',
								marginTop: 130,
							}}
						>
							<input
								type="file"
								onChange={onFileChange}
								accept="application/json"
								hidden
							/>
							select file
						</label>
					</main>
				</Container>
			</div>
		)
	else if (!confirmed && restoredProfile) {
		return (
			<div
				style={{
					width: '100vw',
					minHeight: '100vh',
					backgroundColor: getColor('grey1'),
				}}
			>
				<Container>
					<UserCreateStop restoring />
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
							Is this the correct account?
						</Typography>
						<Avatar
							avatar={restoredProfile?.avatar}
							size={90}
							style={{ marginTop: 50 }}
						/>
						<Typography
							variant="body-bold-16"
							color="grey4"
							style={{ marginTop: 20 }}
						>
							{restoredProfile.username}
						</Typography>
						<div style={{ marginTop: 50 }}>
							<IconButton
								variant="cancel"
								onClick={() => {
									setRestoredProfile(null)
								}}
								style={{ marginRight: 10 }}
							/>
							<IconButton
								variant="confirmAction"
								onClick={() => {
									setConfirmed(true)
									setProfile(restoredProfile)
								}}
							/>
						</div>
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
				<UserCreateStop restoring />
				<main
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
						variant="header-35"
						color="blue"
						style={{ marginTop: 130 }}
					>
						Great!
					</Typography>
					<Typography
						variant="small-light-12"
						color="grey4"
						style={{ marginTop: 10 }}
					>
						You've restored your Swarm City account.
					</Typography>
					<Avatar
						avatar={profile?.avatar}
						size={100}
						style={{ marginTop: 50 }}
					/>
					<Typography
						variant="body-bold-16"
						color="grey4"
						style={{ marginTop: 20 }}
					>
						{profile?.username}
					</Typography>
					<Typography
						variant="small-bold-12"
						color="grey3"
						style={{
							marginTop: 40,
							borderBottom: `2px dotted ${getColor('grey3')}`,
						}}
					>
						{/* FIXME: this should do something on click */}
						show my keys
					</Typography>
					<Button
						color="blue"
						size="large"
						onClick={() => navigate(MARKETPLACES)}
						style={{ marginTop: 65 }}
					>
						enter swarm.city
					</Button>
				</main>
			</Container>
		</div>
	)
}
