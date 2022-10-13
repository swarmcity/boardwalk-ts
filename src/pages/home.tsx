import { useNavigate } from 'react-router-dom'
import { Button } from '@swarm-city/ui-library'

// Store and routes
import { MARKETPLACES } from '../routes'

// Assets
import logo from '../assets/imgs/logo.svg?url'
import { Container } from '../ui/container'
import { Typography } from '../ui/typography'
import { getColor } from '../ui/colors'

export const Home = () => {
	const navigate = useNavigate()
	return (
		<div
			style={{
				width: '100vw',
				minHeight: '100vh',
				overflow: 'hidden',
				backgroundColor: getColor('grey1'),
			}}
		>
			<div style={{ backgroundColor: getColor('yellow') }}>
				<Container>
					<div
						style={{
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
						}}
					>
						<img src={logo} id="logo" style={{ width: 80, marginTop: 146 }} />
						<Typography
							color="grey5"
							variant="body-extra-light-20"
							style={{ marginTop: 32 }}
						>
							Welcome to
						</Typography>
						<Typography color="grey5" variant="header-35">
							<span>swarm.</span>
							<span>city</span>
						</Typography>
						<Button
							size="large"
							bg
							color="yellow-light"
							onClick={() => navigate(MARKETPLACES)}
							style={{ marginTop: 74, marginBottom: 64 }}
						>
							enter here
						</Button>
					</div>
				</Container>
			</div>
			<nav style={{ backgroundColor: getColor('white') }}>
				<Container>
					<div
						style={{
							paddingTop: 40,
							paddingBottom: 40,
							paddingLeft: 56,
							paddingRight: 56,
							display: 'flex',
							flexDirection: 'column',
						}}
					>
						<a
							href="https://swarm.city/"
							className="link"
							target="_blank"
							rel="noreferrer"
						>
							<Typography variant="small-bold-12" color="blue" style={{
							borderBottom: `2px dotted ${getColor('blue')}`,}}>
								What is Swarm City?
							</Typography>
						</a>
						<a
							href="https://discord.com/invite/NvnmBmCavn"
							className="link"
							target="_blank"
							rel="noreferrer"
							style={{ marginTop: 17 }}
						>
							<Typography variant="small-bold-12" color="blue" style={{
							borderBottom: `2px dotted ${getColor('blue')}`,}}>
								Support
							</Typography>
						</a>
					</div>
				</Container>
			</nav>
			<address className="bg-gray-lt">
				<Container>
					<div
						style={{
							paddingTop: 40,
							paddingBottom: 40,
							paddingLeft: 48,
							paddingRight: 48,
							display: 'flex',
							flexDirection: 'column',
						}}
					>
						<Typography variant="small-bold-12" color="grey4">
							Find Swarm City on
						</Typography>
						<a
							className="p-1"
							href="https://discord.com/invite/NvnmBmCavn"
							target="_blank"
							rel="noreferrer"
							style={{ marginTop: 4 }}
						>
							<Typography variant="small-light-12" color="grey4">
								Discord
							</Typography>
						</a>
						<a
							className="p-1"
							href="https://twitter.com/SwarmCityDApp"
							target="_blank"
							rel="noreferrer"
							style={{ marginTop: 4 }}
						>
							<Typography variant="small-light-12" color="grey4">
								Twitter
							</Typography>
						</a>
						<a
							className="p-1"
							href="https://medium.com/swarm-city-times"
							target="_blank"
							rel="noreferrer"
							style={{ marginTop: 4 }}
						>
							<Typography variant="small-light-12" color="grey4">
								Medium
							</Typography>
						</a>
						<a
							className="p-1"
							href="https://github.com/swarmcity"
							target="_blank"
							rel="noreferrer"
							style={{ marginTop: 4 }}
						>
							<Typography variant="small-light-12" color="grey4">
								Github
							</Typography>
						</a>
						<a
							className="p-1"
							href="https://www.youtube.com/channel/UCsHBWn_ytZ3xdMbTyYe5Ifg"
							target="_blank"
							rel="noreferrer"
							style={{ marginTop: 4 }}
						>
							<Typography variant="small-light-12" color="grey4">
								Youtube
							</Typography>
						</a>
					</div>
				</Container>
			</address>
		</div>
	)
}
