import { useEffect, useState } from 'react'
import cn from 'classnames'
import { Wallet } from 'ethers'

// Assets
import avatarImage from '../../../assets/imgs/avatar.svg?url'

// Components
import { ButtonRoundArrow } from '../../button-round-arrow'
import { ButtonClose } from '../../button-close'

// Style
import classes from './password.module.css'

// Store
import { useStore } from '../../../store'

// Types
import type { FormEvent } from 'react'

type PasswordModalProps = {
	show?: boolean
	onClose: () => void
	onSuccess: (wallet: Wallet) => void
}

export const PasswordModal = ({
	show,
	onClose,
	onSuccess,
}: PasswordModalProps) => {
	const [loading, setLoading] = useState(false)
	const [password, setPassword] = useState('')
	const [profile] = useStore.profile()

	useEffect(() => {
		if (!show) {
			setPassword('')
		}
	}, [show])

	if (!show) {
		return null
	}

	// TODO: Show error message somewhere
	if (!profile?.encryptedWallet) {
		console.error('No encryptedWallet')
		return null
	}

	const decrypt = async (event: FormEvent<HTMLElement>) => {
		event.preventDefault()

		setLoading(true)
		try {
			const wallet = await Wallet.fromEncryptedJson(
				profile?.encryptedWallet ?? '',
				password
			)
			onSuccess(wallet)
		} catch (err) {
			// TODO: Show error message somewhere
			// NOTE: Likely invalid password
		} finally {
			setPassword('')
			setLoading(false)
		}
	}

	return (
		<div
			className={cn(classes.passwordModal, 'modal')}
			tabIndex={-1}
			aria-labelledby="pwModalLabel"
			aria-hidden="false"
			style={{ display: 'block' }}
		>
			<div className="modal-dialog modal-fullscreen">
				<div className="modal-content">
					<div className="modal-body">
						<div className="bg-info-50 send-password">
							<main className="flex-space">
								<div className="content">
									<figure className="avatar">
										<img src={avatarImage} alt="user avatar" />
									</figure>
									<form onSubmit={decrypt}>
										<input
											type="password"
											placeholder="password?"
											value={password}
											disabled={loading}
											onChange={(event) =>
												setPassword(event.currentTarget.value)
											}
										/>
									</form>
								</div>
								<div className="btns btn-icons">
									<ButtonClose
										variant="dark"
										className="btn-img close"
										onClick={onClose}
									/>
									<ButtonRoundArrow onClick={decrypt} disabled={loading} />
								</div>
							</main>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
