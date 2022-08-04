import { Link } from '@reach/router'
import { useState } from 'react'

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
import type { Profile } from '../types/profile'
import type { RouteComponentProps } from '@reach/router'
import type { ChangeEvent } from 'react'

type Props = RouteComponentProps

export const AccountRestore = (_: Props) => {
	const [profile, setProfile] = useStore.profile()
	const [restoredProfile, setRestoredProfile] = useState<Profile | null>(null)
	const [confirmed, setConfirmed] = useState(false)

	const onFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
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
			<div className="bg-gray-lt py-60 restore">
				<div className="close">
					<UserCreateStop />
				</div>
				<div className="container">
					<main className="flex-space">
						<header>
							<h1>Upload and unlock your account file.</h1>
						</header>
						<div className="btns">
							<label className="btn btn-light">
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
			<div className="bg-gray-lt py-60 restore-confirm">
				<div className="close">
					<UserCreateStop />
				</div>
				<div className="container">
					<main className="flex-space">
						<header>
							<h1>Is this the correct account?</h1>
						</header>
						<div className="content">
							<figure className="avatar">
								<img
									src={restoredProfile?.avatar || avatarDefault}
									alt="user avatar"
								/>
							</figure>
							<p className="username">{restoredProfile.username}</p>
						</div>
						<div className="btns">
							<a
								className="close"
								onClick={() => {
									setRestoredProfile(null)
								}}
							>
								<img src={cancel} />
							</a>
							<a
								className="btn-icon"
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
		<div className="bg-gray-lt restore-confirmed">
			<div className="close">
				<UserCreateStop />
			</div>
			<div className="container">
				<main className="flex-space">
					<header>
						<h1>Great!</h1>
						<p>You've restored your Swarm City account.</p>
					</header>
					<div className="content">
						<figure className="avatar">
							<img src={profile?.avatar || avatarDefault} alt="user avatar" />
						</figure>
						<p className="username">{profile?.username}</p>
					</div>
					<div className="btns">
						<Link className="btn btn-light" to={ACCOUNT}>
							enter swarm.city
						</Link>
					</div>
				</main>
			</div>
		</div>
	)
}
