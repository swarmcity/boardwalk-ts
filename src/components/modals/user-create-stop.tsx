import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconButton } from '@swarm-city/ui-library'

// Components
import { getColor } from '../../ui/colors'
import { Container } from '../../ui/container'
import { Typography } from '../../ui/typography'

// Routes and store
import { MARKETPLACES } from '../../routes'
import { useStore } from '../../store'

export const UserCreateStop = () => {
	const [shown, setShown] = useState<boolean>()
	const [, setProfile] = useStore.profile()
	const navigate = useNavigate()

	if (!shown) {
		return (
			<div style={{ position: 'relative', width: '100%' }}>
				<div style={{ position: 'absolute', right: 15, top: 15 }}>
					<IconButton variant="close" onClick={() => setShown(true)} />
				</div>
			</div>
		)
	}

	return (
		<div
			style={{
				width: '100vw',
				height: '100vh',
				zIndex: 100,
				position: 'fixed',
				paddingTop: 130,
				backgroundColor: getColor('red'),
				left: 0,
				top: 0,
			}}
		>
			<Container>
				<main
					style={{
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						marginLeft: 40,
						marginRight: 40,
						textAlign: 'center',
					}}
				>
					<Typography variant="header-35" color="white">
						Stop creating user account?
					</Typography>
					<div
						style={{
							marginTop: 210,
							display: 'flex',
							flexDirection: 'row',
							justifyContent: 'center',
							alignItems: 'center',
						}}
					>
						<IconButton
							variant="close"
							onClick={() => setShown(false)}
							style={{ marginRight: 20 }}
						/>
						<IconButton
							variant="confirmDanger"
							onClick={() => {
								setProfile()
								navigate(MARKETPLACES)
							}}
						/>
					</div>
				</main>
			</Container>
		</div>
	)
}
