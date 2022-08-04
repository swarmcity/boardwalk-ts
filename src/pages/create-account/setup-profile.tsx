import { useNavigate } from 'react-router-dom'

// Store and routes
import { useStore } from '../../store'
import { ACCOUNT_PASSWORD } from '../../routes'

// Assets
import avatarDefault from '../../assets/imgs/avatar.svg?url'
import arrowUp from '../../assets/imgs/arrowUp.svg?url'

// Components
import { ButtonRoundArrow } from '../../components/ButtonRoundArrow'
import { UserCreateStop } from '../../components/modals/user-create-stop'
import { CreateAvatar } from '../../components/modals/create-avatar'

// Types
import type { FormEvent } from 'react'

export const SetupProfile = () => {
	const [profile, setProfile] = useStore.profile()
	const navigate = useNavigate()
	const onSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		navigate(ACCOUNT_PASSWORD)
	}

	return (
		<div className="bg-gray-lt choose-username">
			<div className="close">
				<UserCreateStop />
			</div>
			<div className="container">
				<main className="flex-space">
					<header>
						<h1>Choose a username and an avatar.</h1>
					</header>
					<div className="content">
						<CreateAvatar>
							<figure className="avatar">
								<img src={profile?.avatar || avatarDefault} alt="user avatar" />
								<a className="btn-icon btn-info btn-upload">
									<img src={arrowUp} />
								</a>
							</figure>
						</CreateAvatar>
						<form onSubmit={onSubmit}>
							<label htmlFor="username" className="form-label">
								Username
							</label>
							<input
								type="text"
								id="username"
								onChange={(e) =>
									setProfile({ ...profile, username: e.currentTarget.value })
								}
							/>
						</form>
					</div>
					<div className="btns">
						<ButtonRoundArrow
							disabled={!profile?.username}
							to={ACCOUNT_PASSWORD}
						/>
					</div>
				</main>
			</div>
		</div>
	)
}
