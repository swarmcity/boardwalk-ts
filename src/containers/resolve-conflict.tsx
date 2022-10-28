import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAccount } from 'wagmi'
import {
	Button,
	ConfirmModal,
	FullscreenLoading,
	IconButton,
} from '@swarm-city/ui-library'

import { Typography } from '../ui/typography'
import { Avatar } from '../ui/avatar'
import { amountToString, formatName, tokenToDecimals } from '../ui/utils'

import type { User } from '../ui/types'
import { USER } from '../routes'
import { ErrorModal } from '../ui/components/error-modal'

type Props = {
	provider: User
	seeker: User
	amount: bigint
	tokenName: string
}

export function ResolveConflict({
	provider,
	seeker,
	amount,
	tokenName,
}: Props) {
	const [showResolve, setShowResolve] = useState<boolean>(false)
	const [showConfirm, setShowConfirm] = useState<boolean>(false)
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [error, setError] = useState<Error | undefined>()
	const [range, setRange] = useState<number>(0.5)

	const { connector } = useAccount()
	const navigate = useNavigate()

	const resolveConflict = async () => {
		try {
			if (!connector) {
				throw new Error('no connector')
			}

			const signer = await connector.getSigner()
			setIsLoading(true)

			console.log(signer.address)

			setShowConfirm(false)
		} catch (error) {
			console.error()
			setError(error as Error)
		}
		setIsLoading(false)
	}

	if (error) {
		return <ErrorModal onClose={() => setError(undefined)} />
	}

	if (isLoading) {
		return (
			<FullscreenLoading>
				<Typography variant="header-35">Payout is being processed.</Typography>
			</FullscreenLoading>
		)
	}

	if (showConfirm) {
		return (
			<ConfirmModal
				confirm={{ onClick: resolveConflict }}
				cancel={{ onClick: () => setShowConfirm(false) }}
				variant="action"
			>
				<Typography variant="header-35" color="white">
					You're about to send {amountToString(tokenToDecimals(amount) * range)}{' '}
					{tokenName} to {formatName(provider)} and{' '}
					{amountToString(tokenToDecimals(amount) * (1 - range))} {tokenName} to{' '}
					{formatName(seeker)}.
				</Typography>
				<div style={{ paddingTop: 30 }}>
					<Typography variant="small-light-12">
						This can not be undone.
					</Typography>
				</div>
			</ConfirmModal>
		)
	}

	if (showResolve)
		return (
			<div style={{ marginLeft: 30, marginRight: 30, marginBottom: 30 }}>
				<div
					style={{
						display: 'grid',
						gridTemplateColumns: 'min-content auto min-content',
						gridTemplateRows: 'min-content min-content min-content min-content',
					}}
				>
					<div
						style={{
							marginBottom: 35,
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
						}}
					>
						<Typography variant="body-bold-16" color="green">
							{(range * 100).toFixed()}%
						</Typography>
						<Typography variant="body-bold-16" color="yellow">
							{amountToString(tokenToDecimals(amount) * range)} {tokenName}
						</Typography>
					</div>
					<div />
					<div
						style={{
							marginBottom: 35,
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
						}}
					>
						<Typography variant="body-bold-16" color="green">
							{((1 - range) * 100).toFixed()}%
						</Typography>
						<Typography variant="body-bold-16" color="yellow">
							{amountToString(tokenToDecimals(amount) * (1 - range))}{' '}
							{tokenName}
						</Typography>
					</div>

					<div
						style={{
							display: 'flex',
							justifyContent: 'center',
							alignContent: 'center',
							minWidth: 40,
							minHeight: 40,
							cursor: 'pointer',
						}}
						onClick={() => navigate(USER(seeker.address))}
					>
						<Avatar size={40} avatar={seeker.avatar} />
					</div>
					<input
						type="range"
						value={range}
						min={0}
						max={1}
						step={0.1}
						onChange={(e) => setRange(Number(e.target.value))}
						style={{ flexGrow: 1 }}
					/>
					<div
						style={{
							display: 'flex',
							justifyContent: 'center',
							alignContent: 'center',
							minWidth: 40,
							minHeight: 40,
							cursor: 'pointer',
						}}
						onClick={() => navigate(USER(provider.address))}
					>
						<Avatar size={40} avatar={provider.avatar} />
					</div>

					<div
						style={{
							marginTop: 10,
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							cursor: 'pointer',
						}}
						onClick={() => navigate(USER(seeker.address))}
					>
						<Typography variant="small-bold-12" color="blue">
							{formatName(seeker)}
						</Typography>
						<Typography variant="small-bold-12" color="blue">
							{seeker.reputation.toString(10)} SWR
						</Typography>
					</div>
					<div />
					<div
						style={{
							marginTop: 10,
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							cursor: 'pointer',
						}}
						onClick={() => navigate(USER(provider.address))}
					>
						<Typography variant="small-bold-12" color="blue">
							{formatName(provider)}
						</Typography>
						<Typography variant="small-bold-12" color="blue">
							{provider.reputation.toString(10)} SWR
						</Typography>
					</div>
				</div>
				<div style={{ marginTop: 30 }}>
					<IconButton
						variant="cancel"
						style={{ marginRight: 15 }}
						onClick={() => setShowResolve(false)}
					/>

					<IconButton
						variant="confirmAction"
						onClick={() => setShowConfirm(true)}
					/>
				</div>
			</div>
		)

	return (
		<Button size="large" onClick={() => setShowResolve(true)}>
			resolve
		</Button>
	)
}
