// Store
import { Link } from 'react-router-dom'

// Store and routes
import { useStore } from '../../store'
import { ACCOUNT_BACKUP } from '../../routes'

// Components
import { UserCreateStop } from '../../components/modals/user-create-stop'

// Assets
import avatarDefault from '../../assets/imgs/avatar.svg?url'

export const AccountCreated = () => {
	const [profile] = useStore.profile()

	if (!profile) {
		return <div>Error: no profile</div>
	}

	const { username, avatar } = profile

	return (
		<div className="bg-gray-lt account-complete">
			<div className="close">
				<UserCreateStop />
			</div>
			<div className="container">
				<main className="flex-space">
					<header>
						<h1>Great!</h1>
						<p>
							You now have a Swarm City account.
							<br />
							Let's create a backup!
						</p>
					</header>
					<div className="content">
						<figure className="avatar">
							<img src={avatar || avatarDefault} alt="user avatar" />
						</figure>
						<p className="username">{username}</p>
					</div>
					<div className="btns">
						<Link className="btn btn-light" to={ACCOUNT_BACKUP}>
							backup my account
						</Link>
					</div>
				</main>
			</div>
		</div>
	)
}
