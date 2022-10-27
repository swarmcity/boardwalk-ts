import { useState } from 'react'
import { useAccount } from 'wagmi'
import {
	Button,
	ConfirmModal,
	FullscreenLoading,
	IconButton,
	Input,
} from '@swarm-city/ui-library'

import { UserAccount } from '../pages/marketplaces/user-account'
import { getColor } from '../ui/colors'
import { ErrorModal } from '../ui/components/error-modal'
import { Container } from '../ui/container'
import { Typography } from '../ui/typography'

interface Props {
	description: string
	marketplaceName?: string
	marketplaceId: string
	itemId: bigint
}
export const StartConflictContainer = ({
	description,
	marketplaceName,
	marketplaceId,
	itemId,
}: Props) => {
	const [isLoading, setIsLoading] = useState(false)
	const [showMotivation, setShowMotivation] = useState(false)
	const [motivation, setMotivation] = useState<string>('')
	const [showConfirm, setShowConfirm] = useState(false)
	const [error, setError] = useState<Error | undefined>()
	const { connector } = useAccount()

	const startConflict = async () => {
		try {
			if (!connector) {
				throw new Error('no connector')
			}

			const signer = await connector.getSigner()
			setIsLoading(true)

			console.log(signer.address, marketplaceId, itemId, motivation)

			setShowConfirm(false)
			setShowMotivation(false)
			setMotivation('')
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
				<Typography variant="header-35">Action is being processed.</Typography>
			</FullscreenLoading>
		)
	}
	if (showConfirm) {
		return (
			<ConfirmModal
				confirm={{ onClick: startConflict }}
				cancel={{ onClick: () => setShowConfirm(false) }}
				variant="danger"
			>
				<Typography variant="header-35" color="white">
					Do you want to start a conflict on "
					{description.length > 15
						? `${description.substring(0, 15)}...`
						: description}
					"?
				</Typography>
				<div style={{ paddingTop: 30 }}>
					<Typography variant="small-light-12">
						This can't be undone. The marketplace maintainer will be notified to
						help resolve this conflict.
					</Typography>
				</div>
			</ConfirmModal>
		)
	}

	if (showMotivation) {
		return (
			<div
				style={{
					position: 'fixed',
					left: 0,
					right: 0,
					top: 0,
					bottom: 0,
					backgroundColor: getColor('grey1'),
					zIndex: 300,
				}}
			>
				<UserAccount />
				<Container>
					<div
						style={{
							display: 'flex',
							alignItems: 'stretch',
							justifyContent: 'center',
							flexDirection: 'column',
							textAlign: 'left',
						}}
					>
						<Typography
							variant="header-28"
							color="grey4"
							style={{
								marginLeft: 40,
								marginRight: 40,
							}}
						>
							{marketplaceName ?? 'Loading...'}
						</Typography>
						<div
							style={{
								backgroundColor: getColor('white'),
								padding: 40,
								marginLeft: 10,
								marginRight: 10,
								marginTop: 22,
								display: 'flex',
								flexDirection: 'column',
							}}
						>
							<div style={{ marginTop: 40 }}>
								<Input
									id="motivation"
									autoFocus
									value={motivation}
									autoComplete="off"
									onChange={(e) => setMotivation(e.target.value)}
								>
									What's your motivation for putting this deal in conflict?
								</Input>
							</div>
							<div
								style={{
									display: 'flex',
									flexDirection: 'row',
									justifyContent: 'center',
									alignItems: 'center',
									marginTop: 50,
								}}
							>
								<IconButton
									variant="cancel"
									onClick={() => setShowMotivation(false)}
								/>
								<IconButton
									variant="confirmAction"
									onClick={() => setShowConfirm(true)}
									disabled={!motivation}
								/>
							</div>
						</div>
					</div>
				</Container>
			</div>
		)
	}

	return (
		<div
			style={{
				margin: 50,
				display: 'flex',
				justifyContent: 'center',
			}}
		>
			<Button onClick={() => setShowMotivation(true)} disabled={!connector}>
				start conflict
			</Button>
		</div>
	)
}
