import { Wallet } from 'ethers'
import { forwardRef, useImperativeHandle, useState } from 'react'

// Hooks
import { useDeferredPromise } from '../../hooks/useDeferredPromise'

// Components
import { PasswordModal } from './password/password'

// Types
import type { Ref } from 'react'

export type PasswordSignerProps = Record<string, unknown>
export type PasswordSignerRef = {
	getSigner(): Promise<Wallet>
}

const PasswordSignerInner = (
	_: PasswordSignerProps,
	ref: Ref<PasswordSignerRef>
) => {
	const [showPassword, setShowPassword] = useState(false)
	const { defer, deferRef } = useDeferredPromise<Wallet>()

	useImperativeHandle(ref, () => ({
		getSigner: async () => {
			setShowPassword(true)
			const wallet = await defer().promise
			setShowPassword(false)
			return wallet
		},
	}))

	return (
		<PasswordModal
			show={showPassword}
			onClose={() => {
				setShowPassword(false)
				deferRef?.reject(new Error('transaction canceled'))
			}}
			onSuccess={(wallet) => {
				deferRef?.resolve(wallet)
			}}
		/>
	)
}

export const PasswordSigner = forwardRef(PasswordSignerInner)
