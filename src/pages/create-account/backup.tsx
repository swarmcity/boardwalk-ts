import { useCallback, useEffect, useMemo, useState } from 'preact/hooks'
import { Link } from '@reach/router'

// Components
import { UserCreateStop } from '../../components/modals/user-create-stop'
import { ButtonRoundArrow } from '../../components/ButtonRoundArrow'

// Assets
import warningBlue from '../../assets/imgs/warningBlue.svg?url'

// Store and routes
import { ACCOUNT } from '../../routes'
import { useStore } from '../../store'

// Types
import type { RouteComponentProps } from '@reach/router'

type Props = RouteComponentProps

export const Backup = (_: Props) => {
	const [showPrompt, setShowPrompt] = useState(true)
	const [profile] = useStore.profile()
	const blob = useMemo(
		() =>
			new Blob([JSON.stringify(profile)], {
				type: 'application/json',
			}),
		[profile]
	)

	const downloadFile = useCallback(() => {
		const elem = window.document.createElement('a')
		elem.href = window.URL.createObjectURL(blob)
		elem.download = 'swarm-city-wallet.json'
		document.body.appendChild(elem)
		elem.click()
		document.body.removeChild(elem)
	}, [blob])

	useEffect(() => {
		if (!showPrompt) {
			downloadFile()
		}
	}, [showPrompt, downloadFile])

	if (showPrompt) {
		return (
			<div class="bg-gray-lt download-file">
				<div class="close">
					<UserCreateStop />
				</div>
				<div class="container">
					<main class="flex-space">
						<header>
							<h1>Back up your account</h1>
						</header>
						<div class="warning-box">
							<img src={warningBlue} />
							<div>
								<p>
									There are no central servers on which accounts are stored.{' '}
									<br />
									This means you are responsible for your own account at all
									times.
								</p>
							</div>
						</div>
						<ButtonRoundArrow onClick={() => setShowPrompt(false)} />
					</main>
				</div>
			</div>
		)
	}

	return (
		<div class="bg-gray-lt download-success">
			<div class="close">
				<UserCreateStop />
			</div>
			<div class="container">
				<main class="flex-space">
					<header>
						<h1>Save the file in a safe location</h1>
						<p>
							A download should begin. Save the file somehwere safe. With this
							file you will always be able to get access to the funds on your
							wallet.
						</p>
						<p>
							The private key of your account is encrypted with your password.
						</p>
					</header>
					<div>
						<a onClick={() => downloadFile()} class="link">
							force download
						</a>
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
