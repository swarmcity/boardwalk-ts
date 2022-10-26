import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAccount } from 'wagmi'
import { getAddress } from '@ethersproject/address'
import { parseEther } from '@ethersproject/units'
import {
	Input,
	Button,
	IconButton,
	FullscreenLoading,
	ConfirmModal,
} from '@swarm-city/ui-library'

// Components
import { Redirect } from '../../components/redirect'
import { amountToString, tokenToDecimals } from '../../ui/utils'
import { Typography } from '../../ui/typography'
import { Container } from '../../ui/container'
import { ErrorModal } from '../../ui/components/error-modal'

// Lib
import { formatAddressShort } from '../../lib/tools'

// Store and routes
import { useStore } from '../../store'
import {
	LOGIN,
	ACCOUNT_PRIVATE_WALLET,
	ACCOUNT_PUBLIC_WALLET,
} from '../../routes'
import { getColor } from '../../ui/colors'
import {
	useToken,
	useTokenBalanceOf,
	useTokenDecimals,
	useTokenName,
} from '../marketplaces/services/marketplace'
import { APP_TOKEN } from '../../config'

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

interface Props {
	closeModal: () => void
	tokenName: string
}

const Send = ({ closeModal, tokenName }: Props) => {
	const [showConfirm, setShowConfirm] = useState(false)
	const [amount, setAmount] = useState('')
	const [address, setAddress] = useState('')
	const { to, value, isValid } = formatRequest({ amount, address }) // FIXME: this works for tokens with 18 decimals, but not for other
	const [isSending, setSending] = useState(false)
	const [sentSuccessfully, setSentSuccessfully] = useState(false)
	const [error, setError] = useState<Error | undefined>()
	const { connector } = useAccount()

	const token = useToken(APP_TOKEN)

	const submit = () => setShowConfirm(isValid)
	const sendTransaction = async () => {
		if (!connector) {
			setError(new Error('no connector'))
			return
		}
		if (!token) {
			setError(new Error('No token contract.'))
			return
		}

		if (!to || !value) {
			setError(new Error('Value or address not provided.'))
			return
		}
		try {
			const signer = await connector.getSigner()
			setSending(true)

			await token.connect(signer).transfer(to, value)

			setSending(false)
			setSentSuccessfully(true)
		} catch (err) {
			setSending(false)
			setSentSuccessfully(false)
			setError(err as Error)
		}
	}

	if (isSending) {
		return (
			<FullscreenLoading>
				<Typography variant="header-35" color="white">
					Sending is processing
				</Typography>
			</FullscreenLoading>
		)
	}

	if (error) {
		console.error(console.error())
		return <ErrorModal onClose={closeModal} />
	}

	if (sentSuccessfully) {
		return (
			<ConfirmModal confirm={{ onClick: closeModal }} variant="action">
				<Typography variant="header-35" color="white">
					You have successfully sent
					<span style={{ color: getColor('yellow') }}>
						{amountToString(Number(amount))} {tokenName}
					</span>{' '}
					to {formatAddressShort(address)}.
				</Typography>
			</ConfirmModal>
		)
	}

	if (showConfirm) {
		return (
			<ConfirmModal
				cancel={{ onClick: () => setShowConfirm(false) }}
				confirm={{ onClick: () => sendTransaction?.() }}
				variant="action"
			>
				<Typography variant="header-35" color="white">
					Send{' '}
					<span style={{ color: getColor('yellow') }}>
						{amountToString(Number(amount))} {tokenName}
					</span>{' '}
					to {formatAddressShort(address)}?
				</Typography>
				<div style={{ marginTop: 45 }}>
					<Typography variant="small-light-12" color="white">
						This can not be undone.
					</Typography>
				</div>
			</ConfirmModal>
		)
	}

	return (
		<form
			style={{
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'stretch',
				alignItems: 'stretch',
				width: '100%',
			}}
			onSubmit={submit}
		>
			<div style={{ marginTop: 20 }}>
				<Input
					id="amt-send"
					type="number"
					min={0}
					value={amount}
					onChange={(event) => setAmount(event.currentTarget.value)}
					autoFocus
				>
					Amount to send
				</Input>
			</div>
			<div style={{ marginTop: 40 }}>
				<Input
					id="rec-address"
					type="text"
					value={address}
					onChange={(event) => setAddress(event.currentTarget.value)}
				>
					Receiver's address
				</Input>
			</div>

			<div
				style={{
					height: 40,
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'center',
					alignItems: 'center',
				}}
			>
				{!isValid && amount && address && (
					<Typography variant="small-bold-10" color="red">
						Form invalid
					</Typography>
				)}
			</div>
			<div
				style={{
					display: 'flex',
					flexDirection: 'row',
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				<IconButton
					onClick={closeModal}
					variant="cancel"
					style={{ marginRight: 15 }}
				/>
				<IconButton
					variant="conflictNext"
					disabled={!isValid || !amount || !address}
					onClick={submit}
				/>
			</div>
		</form>
	)
}

export const AccountWallet = () => {
	const [profile] = useStore.profile()
	const navigate = useNavigate()

	const tokenName = useTokenName(APP_TOKEN)
	const tokenBalance = useTokenBalanceOf(APP_TOKEN, profile?.address)
	const { decimals } = useTokenDecimals(APP_TOKEN)
	const [sending, setSending] = useState(false)

	if (!profile?.address) {
		return <Redirect to={LOGIN} />
	}

	if (!tokenBalance || !tokenName || !decimals) {
		return (
			<div
				style={{
					width: '100vw',
					minHeight: '100vh',
					backgroundColor: getColor('grey1'),
				}}
			>
				<Container>Loading...</Container>
			</div>
		)
	}

	const userBalance = tokenToDecimals(tokenBalance ?? 0n, decimals)

	return (
		<div
			style={{
				width: '100vw',
				minHeight: '100vh',
				backgroundColor: getColor('grey1'),
			}}
		>
			<Container>
				<div style={{ position: 'relative', width: '100%' }}>
					<div style={{ position: 'absolute', right: 15, top: 15 }}>
						<IconButton variant="close" onClick={() => navigate(-1)} />
					</div>
				</div>
				<main
					style={{
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						marginLeft: 50,
						marginRight: 50,
						marginTop: 130,
						textAlign: 'center',
					}}
				>
					<Typography variant="header-35" color="yellow">
						{userBalance.toFixed(2)} {tokenName}
					</Typography>
					<Link
						to={ACCOUNT_PRIVATE_WALLET}
						style={{
							marginTop: 40,
						}}
					>
						<Typography
							variant="small-bold-12"
							color="grey3"
							style={{
								borderBottom: `2px dotted ${getColor('grey3')}`,
							}}
						>
							show my keys
						</Typography>
					</Link>
				</main>
			</Container>

			<div
				style={{
					width: '100%',
					height: 0,
					borderBottom: `1px solid ${getColor('grey2')}`,
					marginTop: 50,
					marginBottom: 50,
				}}
			/>
			<Container>
				<div
					style={{
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						marginLeft: 50,
						marginRight: 50,
						textAlign: 'center',
					}}
				>
					{sending ? (
						<Send closeModal={() => setSending(false)} tokenName={tokenName} />
					) : (
						<>
							<Button size="large" onClick={() => setSending(true)}>
								send {tokenName}
							</Button>
							<Button
								size="large"
								onClick={() => navigate(ACCOUNT_PUBLIC_WALLET)}
								style={{ marginTop: 10 }}
							>
								receive
							</Button>
						</>
					)}
				</div>
			</Container>
		</div>
	)
}
