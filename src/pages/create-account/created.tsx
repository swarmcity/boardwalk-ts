import { useNavigate } from 'react-router-dom'
import { Button } from '@swarm-city/ui-library'

// Store and routes
import { useStore } from '../../store'
import { ACCOUNT_BACKUP } from '../../routes'

// Components
import { UserCreateStop } from '../../components/modals/user-create-stop'
import { Avatar } from '../../ui/avatar'
import { getColor } from '../../ui/colors'
import { Container } from '../../ui/container'
import { Typography } from '../../ui/typography'

export const AccountCreated = () => {
	const [profile] = useStore.profile()
	const navigate = useNavigate()

	// FIXME: This should probably redirect or do something like that
	if (!profile) {
		return <div>Error: no profile</div>
	}

	const { username, avatar } = profile

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
						You now have a Swarm City account.
					</Typography>
					<Typography
						variant="small-light-12"
						color="grey4"
						style={{ marginTop: 5 }}
					>
						Let's create a backup!
					</Typography>
					<Avatar avatar={avatar} size={100} style={{ marginTop: 50 }} />
					<Typography
						variant="body-bold-16"
						color="grey4"
						style={{ marginTop: 20 }}
					>
						{username}
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
						onClick={() => navigate(ACCOUNT_BACKUP)}
						style={{ marginTop: 65 }}
					>
						backup my account
					</Button>
				</main>
			</Container>
		</div>
	)
}
