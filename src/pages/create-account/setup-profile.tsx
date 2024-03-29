import { useNavigate } from 'react-router-dom'

// Store and routes
import { useStore } from '../../store'
import { ACCOUNT_PASSWORD } from '../../routes'

// Components
import { UserCreateStop } from '../../components/modals/user-create-stop'
import { CreateAvatar } from '../../components/modals/create-avatar'

// Types
import type { FormEvent } from 'react'
import { Container } from '../../ui/container'
import { getColor } from '../../ui/colors'
import { Avatar } from '../../ui/avatar'
import { IconButton, Input } from '@swarm-city/ui-library'
import { Typography } from '../../ui/typography'
import { Arrow } from '../../ui/icons/arrow'

export const SetupProfile = () => {
	const [profile, setProfile] = useStore.profile()
	const navigate = useNavigate()
	const onSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		navigate(ACCOUNT_PASSWORD)
	}

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
				<UserCreateStop />
				<main
					style={{
						marginTop: 130,
						marginLeft: 40,
						marginRight: 40,
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						textAlign: 'center',
					}}
				>
					<Typography variant="header-35" color="grey2-light-text">
						Choose a username and an avatar.
					</Typography>

					<CreateAvatar>
						<Avatar
							avatar={profile?.avatar}
							size={90}
							style={{ marginTop: 45, cursor: 'pointer' }}
						/>
						<div
							style={{ position: 'relative', width: '100%', cursor: 'pointer' }}
						>
							<div
								style={{
									position: 'absolute',
									right: -10,
									bottom: 0,
									backgroundColor: getColor('grey5'),
									borderRadius: '50%',
									width: 30,
									height: 30,
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.25)',
									cursor: 'pointer',
								}}
							>
								<Arrow />
							</div>
						</div>
					</CreateAvatar>

					<form onSubmit={onSubmit} style={{ maxWidth: 300, marginTop: 40 }}>
						<Input
							type="text"
							id="username"
							onChange={(e) =>
								setProfile({ ...profile, username: e.currentTarget.value })
							}
						>
							Username
						</Input>
					</form>
					<IconButton
						style={{ marginTop: 45 }}
						variant="conflictNext"
						disabled={!profile?.username}
						onClick={() => navigate(ACCOUNT_PASSWORD)}
					/>
				</main>
			</Container>
		</div>
	)
}
