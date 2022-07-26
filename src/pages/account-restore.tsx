import { Link } from '@reach/router'
import { useState } from 'preact/hooks'

// Assets
import avatarDefault from '../assets/imgs/avatar.svg?url'
import checkMarkBlue from '../assets/imgs/checkMarkBlue.svg?url'
import cancel from '../assets/imgs/cancel.svg?url'

// Store and routes
import { useStore } from '../store'
import { ACCOUNT } from '../routes'

// Components
import { UserCreateStop } from '../components/modals/user-create-stop'

// Types
import type { JSXInternal } from 'preact/src/jsx'
import type { Profile } from '../types/profile'
import type { RouteComponentProps } from '@reach/router'

type Props = RouteComponentProps

export const AccountRestore = (_: Props) => {
	const [profile, setProfile] = useStore.profile()
	const [restoredProfile, setRestoredProfile] = useState<Profile | null>(null)
	const [confirmed, setConfirmed] = useState(false)

	const onFileChange = async (
		event: JSXInternal.TargetedEvent<HTMLInputElement, Event>
	) => {
		if (!(event.target instanceof HTMLInputElement)) {
			return
		}

		if (event.target.files?.length) {
			const file = event.target.files[0]
			setRestoredProfile(JSON.parse(await file.text()))
		}
	}

	if (!confirmed && !restoredProfile)
		return (
			<div class="bg-gray-lt py-60 restore">
				<div class="close">
					<UserCreateStop />
				</div>
				<div class="container">
					<main class="flex-space">
						<header>
							<h1>Upload and unlock your account file.</h1>
						</header>
						<div class="btns">
							<label class="btn btn-light">
								<input
									type="file"
									onChange={onFileChange}
									accept="application/json"
									hidden
								/>
								select file
							</label>
						</div>
					</main>
				</div>
			</div>
		)
	else if (!confirmed && restoredProfile) {
		return (
			<div class="bg-gray-lt py-60 restore-confirm">
				<div class="close">
					<UserCreateStop />
				</div>
				<div class="container">
					<main class="flex-space">
						<header>
							<h1>Is this the correct account?</h1>
						</header>
						<div class="content">
							<figure class="avatar">
								<img
									src={restoredProfile?.avatar || avatarDefault}
									alt="user avatar"
								/>
							</figure>
							<p class="username">{restoredProfile.username}</p>
						</div>
						<div class="btns">
							<a
								class="close"
								onClick={() => {
									setRestoredProfile(null)
								}}
							>
								<img src={cancel} />
							</a>
							<a
								class="btn-icon"
								onClick={() => {
									setConfirmed(true)
									setProfile(restoredProfile)
								}}
							>
								<img src={checkMarkBlue} />
							</a>
						</div>
					</main>
				</div>
			</div>
		)
	}

	return (
		<div class="bg-gray-lt restore-confirmed">
			<div class="close">
				<UserCreateStop />
			</div>
			<div class="container">
				<main class="flex-space">
					<header>
						<h1>Great!</h1>
						<p>You've restored your Swarm City account.</p>
					</header>
					<div class="content">
						<figure class="avatar">
							<img src={profile?.avatar || avatarDefault} alt="user avatar" />
						</figure>
						<p class="username">{profile?.username}</p>
					</div>
					<div class="btns">
						<Link className="btn btn-light" to={ACCOUNT}>
							enter swarm.city
						</Link>
					</div>
				</main>
			</div>
		</div>
	)
}
