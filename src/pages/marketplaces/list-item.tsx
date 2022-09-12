import { useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { IconButton, Input, ConfirmModal } from '@swarm-city/ui-library'

// Hooks
import { useWakuContext } from '../../hooks/use-waku'

// Types
import type { MouseEvent } from 'react'
import { createItem } from './services/marketplace-items'
import { useAccount } from 'wagmi'
import { useMarketplaceName } from './services/marketplace'
import { Container } from '../../ui/container'
import { Typography } from '../../ui/typography'

export const MarketplaceListItem = () => {
	const { id } = useParams<string>()
	if (!id) {
		throw new Error('no id')
	}

	const [description, setDescription] = useState<string>()
	const [price, setPrice] = useState<number>()
	const [confirmationReq, setConfirmationReq] = useState<boolean>(false)
	const { waku } = useWakuContext()
	const { connector } = useAccount()
	const navigate = useNavigate()
	const fee = 0.5 // TODO: this should somehow be estimated, right?
	const name = useMarketplaceName(id)

	const submit = async (event: MouseEvent) => {
		event.preventDefault()

		if (!waku || !connector) {
			// TODO: Error message
			return
		}

		if (!description || !price) {
			// TODO: Error message
			return
		}

		await createItem(waku, id, { price, description }, connector)

		navigate(`/marketplace/${id}`)
	}

	return (
		<>
			{confirmationReq && (
				<ConfirmModal
					cancel={{ onClick: () => setConfirmationReq(false) }}
					confirm={{ onClick: submit }}
				>
					<div style={{ padding: 20 }}>
						<Typography variant="header-35" style={{ marginBottom: 12 }}>
							You are about to post this request for {price} DAI.
						</Typography>
						<Typography>This cannot be undone.</Typography>
						<br />
						<Typography>0.5 DAI fee is included.</Typography>
					</div>
				</ConfirmModal>
			)}
			<Container>
				<Typography
					variant="header-28"
					color="grey4"
					style={{
						marginLeft: 40,
						marginRight: 40,
					}}
				>
					{name ?? 'Loading...'}
				</Typography>
			</Container>
			<Container>
				<div style={{ flexGrow: 1, marginLeft: 10, marginRight: 10 }}>
					<div
						style={{
							backgroundColor: '#FAFAFA',
							boxShadow: '0px 1px 0px #DFDFDF',
							position: 'relative',
						}}
					>
						<div style={{ position: 'absolute', right: 15, top: 15 }}>
							<IconButton
								variant="close"
								onClick={() => navigate(`/marketplace/${id}`)}
							/>
						</div>
						<div style={{ padding: 30 }}>
							<Input
								id="what"
								onChange={(event) => setDescription(event.currentTarget.value)}
							>
								What are you looking for?
							</Input>
							<div
								style={{
									display: 'flex',
									justifyContent: 'space-between',
									alignItems: 'flex-end',
								}}
							>
								<div style={{ flexGrow: 1 }}>
									<Input
										id="amount"
										onChange={(event) =>
											setPrice(Number(event.currentTarget.value))
										}
									>
										What is your offer?
									</Input>
								</div>
								<Typography
									variant="body-bold-16"
									color="yellow"
									style={{
										width: 100,
										marginLeft: 10,
									}}
								>
									DAI
								</Typography>
							</div>
							<div
								style={{
									fontFamily: 'Montserrat',
									fontStyle: 'normal',
									fontWeight: 300,
									fontSize: 12,
									lineHeight: '15px',
									color: '#ACACAC',
									marginTop: 7,
								}}
							>
								+ {fee} DAI fee
							</div>
						</div>
						<div
							style={{
								position: 'relative',
								textAlign: 'right',
								borderTop: '1px solid #DFDFDF',
							}}
						>
							{price && price > 0 ? (
								<div
									style={{
										display: 'flex',
										justifyContent: 'end',
										alignItems: 'center',
										marginRight: 30,
										marginTop: 21,
									}}
								>
									<Typography variant="small-light-12" color="grey3">
										Total cost:
									</Typography>
									<Typography
										variant="header-22"
										color="grey4"
										style={{ marginLeft: 12 }}
									>
										{price + fee} DAI
									</Typography>
								</div>
							) : null}
							<div
								style={{
									position: 'relative',
									textAlign: 'right',
								}}
							>
								<IconButton
									disabled={!price || !description}
									style={{ bottom: -13, right: 46 }}
									variant="requestNext"
									onClick={() => setConfirmationReq(true)}
								>
									Next
								</IconButton>
							</div>
						</div>
					</div>
				</div>
			</Container>
		</>
	)
}
