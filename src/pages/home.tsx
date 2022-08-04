import { Link } from 'react-router-dom'

// Store and routes
import { ACCOUNT, LOGIN } from '../routes'
import { useStore } from '../store'

// Assets
import logo from '../assets/imgs/logo.svg?url'

export const Home = () => {
	const [profile] = useStore.profile()
	const hasProfile = profile?.encryptedWallet

	return (
		<>
			<div className="welcome">
				<div className="bg-warning">
					<main className="container">
						<div className="d-flex w-100">
							<div>
								<img src={logo} id="logo" className="mx-auto" />
								<h1>
									Welcome to
									<br />
									<span>swarm.</span>
									<span>city</span>
								</h1>
							</div>
							<Link
								className="btn btn-warning"
								to={hasProfile ? ACCOUNT : LOGIN}
							>
								enter here
							</Link>
						</div>
					</main>
				</div>
				<nav className="bg-white links">
					<div className="container">
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
					</div>
				</nav>
				<address className="bg-gray-lt">
					<div className="container">
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
					</div>
				</address>
			</div>
		</>
	)
}
