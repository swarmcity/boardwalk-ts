import { useState } from 'preact/hooks'
import warningBlue from '../../assets/imgs/warningBlue.svg?url'
import { ACCOUNT_CREATED } from '../../routes'
import { navigate, RouteComponentProps } from '@reach/router'
import { Wallet } from 'ethers'
import { UserCreateStop } from '../../components/modals/user-create-stop'
import { ButtonRoundArrow } from '../../components/ButtonRoundArrow'
import { useStore } from '../../store'
import { Input } from '../../components/input/input'

type Props = RouteComponentProps

export const ChoosePassword = (_: Props) => {
	const [showPrompt, setShowPrompt] = useState(true)
	const [profile, setProfile] = useStore.profile()
	const [loading, setLoading] = useState(false)
	const [password, setPassword] = useState<string>('')
	const [password2, setPassword2] = useState<string>('')

	const onClick = () => {
		setLoading(true)
		const wallet = Wallet.createRandom()
		wallet.encrypt(password).then((encryptedWallet) => {
			setProfile({
				...profile,
				encryptedWallet,
				address: wallet.address,
			})
			setLoading(false)
			navigate(ACCOUNT_CREATED)
		})
	}

	if (showPrompt)
		return (
			<div class="bg-gray-lt password-warning">
				<div class="close">
					<UserCreateStop />
				</div>
				<div class="container">
					<main class="flex-space">
						<header>
							<h1>Choose a password.</h1>
						</header>
						<div class="warning-box">
							<img src={warningBlue} />
							<div>
								<p>There is no password recovery available in Swarm City.</p>
								<p>Choose your password with care.</p>
							</div>
						</div>
						<div class="btns">
							<ButtonRoundArrow onClick={() => setShowPrompt(false)} />
						</div>
					</main>
				</div>
			</div>
		)
	return (
		<div class="bg-gray-lt choose-password">
			<div class="close">
				<UserCreateStop />
			</div>
			<div class="container">
				<main class="flex-space">
					<header>
						<h1>Choose a password.</h1>
					</header>
					<form>
						<Input
							id="password"
							type="password"
							onChange={(e) => setPassword(e.currentTarget.value)}
						>
							password
						</Input>
						<Input
							id="passwordConfirm"
							type="password"
							onChange={(e) => setPassword2(e.currentTarget.value)}
						>
							confirm password
						</Input>
					</form>
					<div style={{ height: '100px', width: '100%' }}>
						{loading && <p>Encrypting...</p>}
						{password2 && password !== password2 && (
							<p class="error">Password mismatch</p>
						)}
					</div>
					<div class="btns">
						<ButtonRoundArrow
							disabled={!password || password !== password2 || loading}
							onClick={onClick}
						/>
					</div>
				</main>
			</div>
		</div>
	)
}
