import { useEffect, useState } from 'react'
import { Wallet } from 'ethers'

// Components
import { ButtonRoundArrow } from '../../button-round-arrow'
import { ButtonClose } from '../../button-close'

// Store
import { useStore } from '../../../store'

// Types
import type { FormEvent } from 'react'
import { Avatar } from '../../../ui/avatar'

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
			style={{
				width: '100vw',
				height: '100vh',
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'center',
				alignItems: 'center',
				position: 'fixed',
				zIndex: 100,
				backdropFilter: 'blur(8px)',
			}}
		>
			<Avatar size={80} />
			<form onSubmit={decrypt} style={{ marginTop: 50 }}>
				<input
					type="password"
					placeholder="password?"
					value={password}
					disabled={loading}
					onChange={(event) => setPassword(event.currentTarget.value)}
				/>
			</form>
			<div
				style={{
					display: 'flex',
					flexDirection: 'row',
					justifyContent: 'center',
					alignItems: 'center',
					marginTop: 80,
				}}
			>
				<ButtonClose
					variant="dark"
					className="btn-img close"
					onClick={onClose}
				/>
				<ButtonRoundArrow onClick={decrypt} disabled={loading} />
			</div>
		</div>
	)
}
