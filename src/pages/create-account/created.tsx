// Store
import { Link } from '@reach/router'

// Store and routes
import { useStore } from '../../store'
import { ACCOUNT_BACKUP } from '../../routes'

// Components
import { UserCreateStop } from '../../components/modals/user-create-stop'

// Assets
import avatarDefault from '../../assets/imgs/avatar.svg?url'

// Types
import type { RouteComponentProps } from '@reach/router'

export const AccountCreated = (_: RouteComponentProps) => {
	const [profile] = useStore.profile()

	if (!profile) {
		return <div>Error: no profile</div>
	}

	const { username, avatar } = profile

	return (
		<div class="bg-gray-lt account-complete">
			<div class="close">
				<UserCreateStop />
			</div>
			<div class="container">
				<main class="flex-space">
					<header>
						<h1>Great!</h1>
						<p>
							You now have a Swarm City account.
							<br />
							Let's create a backup!
						</p>
					</header>
					<div class="content">
						<figure class="avatar">
							<img src={avatar || avatarDefault} alt="user avatar" />
						</figure>
						<p class="username">{username}</p>
					</div>
					<div class="btns">
						<Link className="btn btn-light" to={ACCOUNT_BACKUP}>
							backup my account
						</Link>
					</div>
				</main>
			</div>
		</div>
	)
}
