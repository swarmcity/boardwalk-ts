import { useState } from 'react'
import { Link, useNavigate, Routes, Route } from 'react-router-dom'
import {
	useAccount,
	useBalance,
	useNetwork,
	usePrepareSendTransaction,
	useSendTransaction,
} from 'wagmi'
import { getAddress } from '@ethersproject/address'
import { parseEther } from '@ethersproject/units'

// Components
import { ButtonClose } from '../../components/button-close'
import { Input } from '../../components/input/input'
import { ButtonRoundArrow } from '../../components/button-round-arrow'
import { ConfirmModal } from '../../components/modals/confirm-modal/confirm-modal'
import { FullscreenLoading } from '../../components/modals/fullscreen-loading/fullscreen-loading'
import { Redirect } from '../../components/redirect'

// Lib
import { formatAddressShort, formatBalance } from '../../lib/tools'

// Store and routes
import { useStore } from '../../store'
import {
	LOGIN,
	ACCOUNT_PRIVATE_WALLET,
	ACCOUNT_WALLET_SEND,
	ACCOUNT_WALLET,
	MARKETPLACES,
} from '../../routes'

const Menu = () => {
	const { chain } = useNetwork()
	const symbol = chain?.nativeCurrency?.symbol

	return (
		<div className="flex-space">
			<Link to={ACCOUNT_WALLET_SEND} className="btn btn-info">
				send {symbol}
			</Link>
			<Link to={ACCOUNT_PRIVATE_WALLET} className="btn btn-info">
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

const Send = () => {
	const [showConfirm, setShowConfirm] = useState(false)
	const [amount, setAmount] = useState('0')
	const [address, setAddress] = useState('')
	const { to, value, isValid } = formatRequest({ amount, address })

	const { chain } = useNetwork()
	const symbol = chain?.nativeCurrency?.symbol

	const { config } = usePrepareSendTransaction({ request: { to, value } })
	const { isLoading, isError, isSuccess, error, sendTransaction, reset } =
		useSendTransaction(config)

	const navigate = useNavigate()
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
				<p>{error?.message}</p>
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
				<p>{error?.message}</p>
			</ConfirmModal>
		)
	}

	if (showConfirm) {
		return (
			<ConfirmModal
				cancel={{ onClick: () => setShowConfirm(false) }}
				confirm={{
					onClick: () => sendTransaction?.(),
					variant: 'check',
					disabled: !sendTransaction,
				}}
			>
				<h1 style={{ color: '#fafafa' }}>
					Send{' '}
					<span className="text-warning">
						{amount} {symbol}
					</span>{' '}
					to {formatAddressShort(address)}?
				</h1>
				<p>This cannot be undone.</p>
			</ConfirmModal>
		)
	}

	return (
		<div className="flex-space user-wallet-send">
			<form className="send" onSubmit={submit}>
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

				<div className="btns btn-icons">
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

export const AccountWallet = () => {
	const [profile] = useStore.profile()

	const { chain } = useNetwork()
	const symbol = chain?.nativeCurrency?.symbol

	const { address } = useAccount()
	const { data: balance } = useBalance({
		addressOrName: address,
		watch: true,
	})

	if (!profile?.address) {
		return <Redirect to={LOGIN} />
	}

	return (
		<div className="bg-gray-lt user-wallet">
			<div className="close">
				<ButtonClose to={MARKETPLACES} variant="dark" />
			</div>
			<div className="container">
				<div className="flex-space">
					<div className="wallet-balance">
						{balance ? (
							<>
								{formatBalance(balance)}{' '}
								<span className="usd"> ≈ {balance.formatted} USD</span>
							</>
						) : (
							<>
								0.00 {symbol} <span className="usd"> ≈ 0.0 USD</span>
							</>
						)}
					</div>
					<div>
						<Link to={ACCOUNT_PRIVATE_WALLET} className="link link-dark">
							show my keys
						</Link>
					</div>
				</div>
			</div>
			<div className="divider short" />
			<div className="container">
				<Routes>
					<Route element={<Send />} path="/send" />
					<Route element={<Menu />} path="*" />
				</Routes>
			</div>
		</div>
	)
}
