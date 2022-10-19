import { useEffect, useState, FormEvent } from 'react'
import { Wallet } from 'ethers'
import { IconButton, Input } from '@swarm-city/ui-library'

// Store
import { useStore } from '../../../store'

// Component
import { Avatar } from '../../../ui/avatar'

// Styles
import classes from './password.module.css'

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
			className={classes.root}
		>
			<Avatar size={80} />
			<form onSubmit={decrypt} style={{ marginTop: 40 }}>
				<Input
					id="password"
					autoFocus
					type="password"
					placeholder="password?"
					value={password}
					disabled={loading}
					onChange={(event) => setPassword(event.currentTarget.value)}
				/>
			</form>
			<div className={classes.actions}>
				<IconButton variant="cancel" onClick={onClose} />
				<IconButton
					variant="confirmAction"
					onClick={decrypt}
					disabled={loading}
				/>
			</div>
		</div>
	)
}
