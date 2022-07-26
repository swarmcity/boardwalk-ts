import { useState } from 'preact/hooks'
import { Redirect } from '@reach/router'
import { QRCodeSVG } from 'qrcode.react'

// Components
import { ButtonClose } from '../../components/ButtonClose'
import { PasswordModal } from '../../components/modals/password/password'
import { CopyLink } from '../../components/copy-link/copy-link'

// Store and routes
import { useStore } from '../../store'
import { LOGIN, ACCOUNT_WALLET } from '../../routes'

// Types
import type { RouteComponentProps } from '@reach/router'

type AccountPublicWalletProps = RouteComponentProps

export const AccountPublicWallet = (_: AccountPublicWalletProps) => {
	const [showQR, setShowQR] = useState(false)
	const [showPassword, setShowPassword] = useState(false)
	const [privateKey, setPrivateKey] = useState<string>()
	const [profile] = useStore.profile()

	if (!profile?.address) {
		return <Redirect to={LOGIN} noThrow />
	}

	return (
		<div class="bg-gray-lt keys">
			<PasswordModal
				show={showPassword}
				onClose={() => setShowPassword(false)}
				onSuccess={(wallet) => {
					setPrivateKey(wallet.privateKey)
					setShowPassword(false)
				}}
			/>

			<div class="close">
				<ButtonClose to={ACCOUNT_WALLET} variant="dark" />
			</div>

			<main class="flex-space">
				<div class="container">
					<p>Your address:</p>
					<p class="key key-public">{profile.address}</p>
					<div class="links">
						<CopyLink text={profile?.address ?? ''} class="link">
							copy address
						</CopyLink>
						<a
							class="link"
							style={{ cursor: 'pointer' }}
							onClick={() => setShowQR(!showQR)}
						>
							{showQR ? 'hide' : 'show'} QR code
						</a>
					</div>
					{showQR && (
						<figure class="qrcode">
							<QRCodeSVG value={profile.address} />
						</figure>
					)}
				</div>
				<div class="divider" />
				<div class="container">
					<p>Your private key:</p>
					<p class="key key-private key-hidden">
						Be careful in displaying your private key. It's the only thing
						needed to steal your funds.
					</p>
				</div>
				<div class="container">
					{privateKey ? (
						<>
							<p class="key key-private key-shown">{privateKey}</p>
							<div class="links">
								<CopyLink text={privateKey} class="link">
									copy private key
								</CopyLink>
								<a
									class="link"
									style={{ cursor: 'pointer' }}
									onClick={() => setPrivateKey('')}
								>
									hide private key
								</a>
							</div>
						</>
					) : (
						<div class="btns">
							<button
								class="btn btn-light"
								onClick={() => setShowPassword(true)}
							>
								show private key
							</button>
						</div>
					)}
				</div>
			</main>
		</div>
	)
}
