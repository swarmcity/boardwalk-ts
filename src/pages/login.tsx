import { useNavigate } from 'react-router-dom'
import { Button, IconButton } from '@swarm-city/ui-library'
import { ACCOUNT_RESTORE, CREATE_ACCOUNT } from '../routes'
import { getColor } from '../ui/colors'
import { Typography } from '../ui/typography'
import { Container } from '../ui/container'

export const Login = () => {
	const navigate = useNavigate()
	return (
		<div
			style={{
				backgroundColor: getColor('blue'),
				minHeight: '100vh',
				width: '100vw',
				overflowX: 'hidden',
			}}
		>
			<Container>
				<div style={{ position: 'relative', width: '100%' }}>
					<div style={{ position: 'absolute', right: 15, top: 15 }}>
						<IconButton variant="cancelCreation" onClick={() => navigate(-1)} />
					</div>
				</div>
				<div
					style={{
						marginTop: 130,
						marginLeft: 10,
						marginRight: 10,
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						textAlign: 'center',
					}}
				>
					<Typography variant="header-35" color="white">
						Let's create an account.
					</Typography>
					<Typography
						variant="small-light-12"
						color="white"
						style={{ marginTop: 18 }}
					>
						No account was found on this device. When you restore or create a
						new account, it is stored locally on your device.
					</Typography>
					<div style={{ marginTop: 158 }}>
						<Button
							color="blue-light"
							bg
							size="large"
							onClick={() => navigate(CREATE_ACCOUNT)}
							style={{ margin: 5 }}
						>
							create account
						</Button>
						<Button
							color="blue-light"
							bg
							size="large"
							onClick={() => navigate(ACCOUNT_RESTORE)}
							style={{ margin: 5 }}
						>
							restore account
						</Button>
					</div>
				</div>
			</Container>
		</div>
	)
}
