import { Link, useNavigate } from 'react-router-dom'

// Store and routes
import { MARKETPLACES } from '../routes'

// Assets
import logo from '../assets/imgs/logo.svg?url'
import { Container } from '../ui/container'
import { Typography } from '../ui/typography'
import { Button } from '@swarm-city/ui-library'

export const Home = () => {
	const navigate = useNavigate()
	return (
		<div>
			<div className="bg-warning">
				<Container>
					<div className="d-flex w-100">
						<div>
							<img src={logo} id="logo" style={{ width: 80 }} />
							<Typography color="grey5" variant="body-extra-light-20">
								Welcome to
							</Typography>
							<br />
							<Typography color="grey5" variant="header-35">
								<span>swarm.</span>
								<span>city</span>
							</Typography>
						</div>
						<Button
							size="large"
							bg
							variant="action"
							onClick={() => navigate(MARKETPLACES)}
						>
							enter here
						</Button>
					</div>
				</Container>
			</div>
			<nav className="bg-white links">
				<Container>
					<span>
						<a
							href="https://swarm.city/"
							className="link"
							target="_blank"
							rel="noreferrer"
						>
							What is Swarm City?
						</a>
					</span>
					<span>
						<a
							href="https://discord.com/invite/NvnmBmCavn"
							className="link"
							target="_blank"
							rel="noreferrer"
						>
							Support
						</a>
					</span>
				</Container>
			</nav>
			<address className="bg-gray-lt">
				<Container>
					<div className="p-1">
						<b>Find Swarm City on</b>
					</div>
					<div>
						<a
							className="p-1"
							href="https://discord.com/invite/NvnmBmCavn"
							target="_blank"
							rel="noreferrer"
						>
							Discord
						</a>
					</div>
					<div>
						<a
							className="p-1"
							href="https://twitter.com/SwarmCityDApp"
							target="_blank"
							rel="noreferrer"
						>
							Twitter
						</a>
					</div>
					<div>
						<a
							className="p-1"
							href="https://medium.com/swarm-city-times"
							target="_blank"
							rel="noreferrer"
						>
							Medium
						</a>
					</div>
					<div>
						<a
							className="p-1"
							href="https://github.com/swarmcity"
							target="_blank"
							rel="noreferrer"
						>
							Github
						</a>
					</div>
					<div>
						<a
							className="p-1"
							href="https://www.youtube.com/channel/UCsHBWn_ytZ3xdMbTyYe5Ifg"
							target="_blank"
							rel="noreferrer"
						>
							Youtube
						</a>
					</div>
				</Container>
			</address>
		</div>
	)
}
