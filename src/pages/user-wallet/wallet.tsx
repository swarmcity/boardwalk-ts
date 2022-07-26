import { useState } from 'preact/hooks'
import { Link, navigate, Redirect, Router } from '@reach/router'
import { useAccount, useBalance, useNetwork, useSendTransaction } from 'wagmi'
import { getAddress } from '@ethersproject/address'
import { parseEther } from '@ethersproject/units'

// Components
import { ButtonClose } from '../../components/ButtonClose'
import { Input } from '../../components/input/input'
import { ButtonRoundArrow } from '../../components/ButtonRoundArrow'
import { ConfirmModal } from '../../components/modals/confirm-modal/confirm-modal'
import { FullscreenLoading } from '../../components/modals/fullscreen-loading/fullscreen-loading'

// Lib
import { formatAddressShort, formatBalance } from '../../lib/tools'

// Store and routes
import { useStore } from '../../store'
import {
	LOGIN,
	ACCOUNT,
	ACCOUNT_PUBLIC_WALLET,
	ACCOUNT_WALLET_SEND,
	ACCOUNT_WALLET,
} from '../../routes'

// Types
import type { RouteComponentProps } from '@reach/router'

const Menu = (_: RouteComponentProps) => {
	const { activeChain } = useNetwork()
	const symbol = activeChain?.nativeCurrency?.symbol

	return (
		<div class="flex-space">
			<Link to={ACCOUNT_WALLET_SEND} className="btn btn-info">
				send {symbol}
			</Link>
			<Link to={ACCOUNT_PUBLIC_WALLET} className="btn btn-info">
				receive
			</Link>
		</div>
	)
}

const formatRequest = ({
	address,
	amount,
}: {
	address: string
	amount: string
}) => {
	let to, value
	let isValid = true

	try {
		to = getAddress(address)
		value = parseEther(amount)
	} catch (_) {
		isValid = false
	}

	return { to, value, isValid }
}

const Send = (_: RouteComponentProps) => {
	const [showConfirm, setShowConfirm] = useState(false)
	const [amount, setAmount] = useState('0')
	const [address, setAddress] = useState('')
	const { to, value, isValid } = formatRequest({ amount, address })

	const { activeChain } = useNetwork()
	const symbol = activeChain?.nativeCurrency?.symbol

	const { isLoading, isError, isSuccess, error, sendTransaction, reset } =
		useSendTransaction({ request: { to, value } })

	const submit = () => setShowConfirm(isValid)

	if (isLoading) {
		return <FullscreenLoading />
	}

	if (isError) {
		return (
			<ConfirmModal
				confirm={{ onClick: () => reset(), variant: 'checkRed' }}
				color="danger"
			>
				<h1 style={{ color: '#fafafa', marginBottom: '25px' }}>
					Something went wrong, please try again later.
				</h1>
				<p>{error}</p>
			</ConfirmModal>
		)
	}

	if (isSuccess) {
		return (
			<ConfirmModal
				confirm={{ onClick: () => navigate(ACCOUNT_WALLET), variant: 'green' }}
				color="success"
			>
				<h1 style={{ color: '#fafafa' }}>{symbol} has been sent.</h1>
				<p>{error}</p>
			</ConfirmModal>
		)
	}

	if (showConfirm) {
		return (
			<ConfirmModal
				cancel={{ onClick: () => setShowConfirm(false) }}
				confirm={{ onClick: () => sendTransaction(), variant: 'check' }}
			>
				<h1 style={{ color: '#fafafa' }}>
					Send{' '}
					<span class="text-warning">
						{amount} {symbol}
					</span>{' '}
					to {formatAddressShort(address)}?
				</h1>
				<p>This cannot be undone.</p>
			</ConfirmModal>
		)
	}

	return (
		<div class="flex-space user-wallet-send">
			<form class="send" onSubmit={submit}>
				<Input
					id="amt-send"
					type="number"
					min={0}
					value={amount}
					onChange={(event) => setAmount(event.currentTarget.value)}
				>
					Amount to send
				</Input>
				<Input
					id="rec-address"
					type="text"
					min={0}
					value={address}
					onChange={(event) => setAddress(event.currentTarget.value)}
				>
					Receiver's address
				</Input>

				{!isValid && amount && address && 'Form invalid'}

				<div class="btns btn-icons">
					<ButtonClose to={ACCOUNT_WALLET} className="close" />
					<ButtonRoundArrow
						type="submit"
						className="btn-icon"
						onClick={submit}
					/>
				</div>
			</form>
		</div>
	)
}

export const AccountWallet = (_: RouteComponentProps) => {
	const [profile] = useStore.profile()

	const { activeChain } = useNetwork()
	const symbol = activeChain?.nativeCurrency?.symbol

	const { data: account } = useAccount()
	const { data: balance } = useBalance({
		addressOrName: account?.address,
		watch: true,
	})

	if (!profile?.address) {
		return <Redirect to={LOGIN} noThrow />
	}

	return (
		<div class="bg-gray-lt user-wallet">
			<div class="close">
				<ButtonClose to={ACCOUNT} variant="dark" />
			</div>
			<div class="container">
				<div class="flex-space">
					<div class="wallet-balance">
						{balance ? (
							<>
								{formatBalance(balance)}{' '}
								<span class="usd"> ≈ {balance.formatted} USD</span>
							</>
						) : (
							<>
								0.00 {symbol} <span class="usd"> ≈ 0.0 USD</span>
							</>
						)}
					</div>
					<div>
						<Link to={ACCOUNT_PUBLIC_WALLET} className="link link-dark">
							show my keys
						</Link>
					</div>
				</div>
			</div>
			<div class="divider short" />
			<div class="container">
				<Router>
					<Send path="/send" />
					<Menu default />
				</Router>
			</div>
		</div>
	)
}
