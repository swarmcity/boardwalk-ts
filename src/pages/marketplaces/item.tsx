import { formatUnits } from '@ethersproject/units'
import { FormEvent, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { useAccount, useNetwork } from 'wagmi'
import { hexlify } from '@ethersproject/bytes'
import { getAddress } from '@ethersproject/address'

// Hooks
import { useWaku } from '../../hooks/use-waku'

// Services
import {
	useMarketplaceItem,
	useMarketplaceName,
	useMarketplaceTokenDecimals,
} from './services/marketplace'
import {
	createReply,
	ItemReplyClean,
	useItemReplies,
} from './services/marketplace-item'
import { Item, Status, useMarketplaceItems } from './services/marketplace-items'
import { useProfile } from '../../services/profile'
import { useProfilePictureURL } from '../../services/profile-picture'
import { cancelItem, fundItem, payoutItem } from '../../services/item'

// Assets
import avatarDefault from '../../assets/imgs/avatar.svg?url'

// Protos
import {
	createSelectProvider,
	useSelectProvider,
} from '../../services/select-provider'
import { SelectProvider } from '../../protos/select-provider'
import {
	Button,
	ConfirmModal,
	FullscreenLoading,
	IconButton,
	Input,
	RequestItem,
} from '@swarm-city/ui-library'
import { useStore } from '../../store'
import { Container } from '../../ui/container'
import { Typography } from '../../ui/typography'
import { getColor } from '../../ui/colors'
import { Reply as ReplyUI } from '../../ui/components/reply'
import { formatName, formatMoney } from '../../ui/utils'
import { Reply, User } from '../../ui/types'
import { ErrorModal } from '../../ui/components/error-modal'
import { InDeal } from '../../ui/components/in-deal'
import { PaymentDetail } from '../../ui/components/payment-detail'

const Statuses = {
	[Status.None]: 'None',
	[Status.Open]: 'Open',
	[Status.Funded]: 'Funded',
	[Status.Done]: 'Done',
	[Status.Disputed]: 'Disputed',
	[Status.Resolved]: 'Resolved',
	[Status.Cancelled]: 'Cancelled',
}

type ReplyFormProps = {
	item: Item
	marketplace: string
	decimals: number | undefined
	onCancel: () => void
}

const ReplyForm = ({
	item,
	marketplace,
	decimals,
	onCancel,
}: ReplyFormProps) => {
	const [text, setText] = useState('')
	const [profile] = useStore.profile()
	const [error, setError] = useState<Error | undefined>()

	const { waku, waiting } = useWaku()
	const { connector } = useAccount()

	const postReply = async (event: FormEvent<HTMLElement>) => {
		event.preventDefault()

		if (!waku || !connector) {
			setError(new Error('no waku or connector'))
			return
		}

		try {
			await createReply(waku, marketplace, item.id, { text }, connector)
			setText('')
			// FIXME: this is not correct way of doing it, but better than nothing for now
			location.reload()
		} catch (e) {
			setError(e as Error)
		}
	}

	if (error) {
		return <ErrorModal error={error} onClose={() => setError(undefined)} />
	}

	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'stretch',
				flexGrow: 1,
				width: '100%',
			}}
		>
			<div
				style={{
					display: 'flex',
					flexDirection: 'row',
					alignItems: 'center',
					justifyContent: 'stretch',
					flexGrow: 1,
					width: '100%',
				}}
			>
				<div>
					<img
						style={{
							width: 40,
							height: 'auto',
							borderRadius: '50%',
							margin: '0 12px 0 0',
							borderStyle: 'none',
						}}
						src={profile?.avatar ?? avatarDefault}
					/>
				</div>
				<div
					style={{
						display: 'flex',
						flexDirection: 'column',
						justifyContent: 'stretch',
						alignItems: 'center',
						textAlign: 'left',
						width: '100%',
					}}
				>
					<div style={{ width: '100%' }}>
						<Input
							id="reply"
							onChange={(event) => setText(event.currentTarget.value)}
						>
							Your reply
						</Input>
					</div>
					<Typography
						variant="body-bold-16"
						style={{
							marginTop: 12,
							width: '100%',
						}}
					>
						{decimals === undefined
							? 'Loading...'
							: `for ${formatUnits(item.price, decimals)} DAI.`}
					</Typography>
				</div>
			</div>
			<div style={{ marginTop: 26 }}>
				<IconButton variant="cancel" onClick={onCancel} />
				<IconButton
					variant="confirmAction"
					onClick={postReply}
					disabled={waiting}
				/>
			</div>
		</div>
	)
}

const ReplyContainer = ({
	reply: replyItem,
	isMyReply,
	isMyRequest,
	status,
	setSelectedReply,
	amount,
}: {
	reply: ItemReplyClean
	isMyReply: boolean
	isMyRequest: boolean
	status: Status
	setSelectedReply: (reply: Reply | undefined) => void
	amount: number
}) => {
	// Profile
	const { profile } = useProfile(replyItem.from)
	const avatar = useProfilePictureURL(profile?.pictureHash)

	const user: User = {
		name: profile?.username,
		address: replyItem.from,
		reputation: 0n,
		avatar,
	}

	const reply: Reply = {
		text: replyItem.text,
		date: new Date(),
		amount,
		isMyReply,
		user,
	}

	return (
		<ReplyUI
			reply={reply}
			onSelectClick={() => setSelectedReply(reply)}
			showSelectBtn={status === Status.Open && isMyRequest}
		/>
	)
}

const PayoutItem = ({
	marketplace,
	item,
	amount,
	user,
}: {
	marketplace: string
	item: bigint
	amount: number
	user: string
}) => {
	const { connector } = useAccount()

	// State
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<Error>()
	const [success, setSuccess] = useState(false)
	const [confirm, setConfirm] = useState(false)

	// Payout function
	const canPayout = connector
	const payout = async () => {
		if (!canPayout) {
			return
		}

		setLoading(true)
		setSuccess(false)

		try {
			await payoutItem(connector, marketplace, item)
			setSuccess(true)
			setError(undefined)
		} catch (err) {
			console.error(err)
			setError(err as Error)
		} finally {
			setLoading(false)
			// FIXME: this is not correct way of doing it, but better than nothing for now
			location.reload()
		}
	}

	if (error) {
		return <ErrorModal error={error} onClose={() => setError(undefined)} />
	}

	if (loading) {
		return (
			<FullscreenLoading>
				<Typography variant="header-35">Payout is being processed.</Typography>
			</FullscreenLoading>
		)
	}

	if (confirm) {
		return (
			<ConfirmModal
				variant="action"
				confirm={{ onClick: payout }}
				cancel={{ onClick: () => setConfirm(false) }}
			>
				<Typography variant="header-35">
					<>
						You're about to pay {amount} DAI to {user}.
					</>
				</Typography>
				<div style={{ paddingTop: 30 }}>
					<Typography variant="small-light-12">
						This cannot be undone.
					</Typography>
				</div>
			</ConfirmModal>
		)
	}

	return (
		<InDeal>
			<Button
				style={{ marginTop: 30 }}
				size="large"
				variant="deal"
				bg
				disabled={loading || success}
				onClick={() => setConfirm(true)}
			>
				payout
			</Button>
		</InDeal>
	)
}

// TODO: Make `data` not optional, as this component should only
// ever be displayed if we actually have all the required data.
const FundDeal = ({
	data,
	marketplace,
	item,
	amount,
	fee,
}: {
	data?: SelectProvider
	marketplace: string
	item: bigint
	amount: number
	fee: number
}) => {
	const { connector } = useAccount()

	// State
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<Error>()
	const [confirm, setConfirm] = useState(false)

	// Fund function
	const canFund = connector && data?.signature
	const fund = async () => {
		if (!canFund) {
			return
		}

		setLoading(true)

		try {
			await fundItem(connector, marketplace, item, data?.signature)
			setError(undefined)
		} catch (err) {
			console.error(err)
			setError(err as Error)
		} finally {
			setLoading(false)
			// FIXME: this is not correct way of doing it, but better than nothing for now
			location.reload()
		}
	}
	if (error) {
		return <ErrorModal error={error} onClose={() => setError(undefined)} />
	}

	if (loading) {
		return (
			<FullscreenLoading>
				<Typography variant="header-35">Funding is being processed.</Typography>
			</FullscreenLoading>
		)
	}

	if (confirm) {
		return (
			<ConfirmModal
				variant="action"
				confirm={{ onClick: fund }}
				cancel={{ onClick: () => setConfirm(false) }}
			>
				<Typography variant="header-35">
					<>You're about to fund this deal with {amount + fee} DAI.</>
				</Typography>
				<div style={{ paddingTop: 30 }}>
					<Typography variant="small-light-12">
						This cannot be undone.
					</Typography>
				</div>
				<div>
					<Typography variant="small-light-12">
						<>{fee} DAI fee is included.</>
					</Typography>
				</div>
			</ConfirmModal>
		)
	}

	return (
		<>
			{/* Show fund deal button*/}
			<div
				style={{
					backgroundColor: getColor('blue'),
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'center',
					textAlign: 'center',
					padding: 30,
				}}
			>
				<Typography variant="body-bold-16" color="white">
					You were selected to make a deal. Do you accept?
				</Typography>
				<div
					style={{
						display: 'flex',
						flexDirection: 'row',
						marginTop: 44,
						justifyContent: 'center',
						alignItems: 'center',
					}}
				>
					<IconButton variant="cancel" style={{ marginRight: 15 }} />
					<IconButton
						variant="confirmAction"
						onClick={() => setConfirm(true)}
					/>
				</div>
			</div>
		</>
	)
}

export const MarketplaceItem = () => {
	const { id, item: itemIdString } = useParams<{ id: string; item: string }>()
	if (!id || !itemIdString) {
		throw new Error('no marketplace ID or request item ID')
	}

	const itemId = BigInt(itemIdString)
	const name = useMarketplaceName(id)

	const { address, connector } = useAccount()
	const { decimals } = useMarketplaceTokenDecimals(id)
	const navigate = useNavigate()
	const { replies } = useItemReplies(id, itemId)
	const selectedProvider = useSelectProvider(id, itemId)
	const provider = useMemo(() => {
		const address = selectedProvider.data?.provider
		return address && getAddress(hexlify(address))
	}, [selectedProvider.lastUpdate])

	const chainItem = useMarketplaceItem(id, itemId)
	const [isReplying, setIsReplying] = useState<boolean>(false)

	// TODO: Replace this with a function that only fetches the appropriate item
	const { loading, waiting, items, lastUpdate } = useMarketplaceItems(id)
	const item = useMemo(() => {
		return items.find(({ id }) => id.eq(itemId))
	}, [lastUpdate])

	const [selectedReply, setSelectedReply] = useState<Reply | undefined>()

	const selectedReplyItemClean = replies.find((r) => r.from === provider)
	const seeker: User | undefined = item?.owner
		? {
				address: item.owner,
				reputation: item?.seekerRep.toBigInt() ?? 0n,
		  }
		: undefined
	const providerUser: User | undefined = chainItem.item?.providerAddress
		? {
				address: chainItem.item.providerAddress,
				reputation: chainItem.item?.providerRep ?? 0n,
		  }
		: undefined
	const user: User | undefined = address
		? {
				address: address,
				reputation: 0n,
		  }
		: undefined
	const store = {
		marketplace: {
			id,
			name,
			decimals,
		},
		request: {
			id: itemId,
			price: item?.price,
			description: item?.metadata.description,
			date: item?.timestamp ? new Date(item?.timestamp) : new Date(),
			status: chainItem && chainItem.item && Statuses[chainItem.item?.status],
			fee: item?.fee,
			myReply: replies.find((r) => r.from === address),
			selectedReply:
				selectedReply ??
				(selectedReplyItemClean !== undefined
					? ({
							text: selectedReplyItemClean.text,
							date: new Date(),
							amount: formatMoney(item?.price || 0n),
							isMyReply: address === selectedReplyItemClean.from,
							user: { address: selectedReplyItemClean.from },
					  } as Reply)
					: undefined),
			replies: replies,
			seeker,
			provider: providerUser,
		},
		user,
	}

	const [loadingSelectProvider, setLoadingSelectProvider] = useState(false)

	const { waku } = useWaku()

	// Wagmi
	const { chain } = useNetwork()

	const selectProvider = async () => {
		if (!waku || !connector || !chain?.id || !name || !selectedReply) {
			return
		}

		setLoadingSelectProvider(true)

		await createSelectProvider(waku, connector, {
			marketplace: {
				address: id,
				chainId: BigInt(chain.id),
				name,
			},
			provider: selectedReply?.user.address,
			item: itemId,
		})

		setLoadingSelectProvider(false)
		location.reload()
	}

	if (!item || !chainItem.item) {
		const text =
			loading || waiting || chainItem.loading
				? 'Loading...'
				: 'Item not found...'

		return (
			<Container>
				<div
					style={{
						flexGrow: 1,
						marginLeft: 40,
						marginRight: 40,
						width: '100%',
					}}
				>
					<Typography variant="header-28" color="grey4">
						{text}
					</Typography>
				</div>
			</Container>
		)
	}

	const canCancel = connector
	const cancel = async () => {
		if (!canCancel) {
			throw new Error('no connector')
		}

		await cancelItem(connector, id, itemId)
		navigate(`/marketplace/${id}`)
	}

	const { status } = chainItem.item

	const isSelectedReplyMyReply =
		store.request.selectedReply?.user.address === store.user?.address
	const isMyRequest = store.request.seeker?.address === store.user?.address
	const showSelectProviderBtn = status === Status.Open && !selectedProvider.data

	return (
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
					{name ?? 'Loading...'}
				</Typography>
				<div
					style={{
						backgroundColor: '#FAFAFA',
						borderBottom: '1px dashed #DFDFDF',
						position: 'relative',
						padding: 30,
						marginLeft: 10,
						marginRight: 10,
					}}
				>
					<div style={{ position: 'absolute', right: 15, top: 15 }}>
						<IconButton
							variant="close"
							onClick={() => navigate(`/marketplace/${id}`)}
						/>
					</div>
					<RequestItem
						detail
						title={store.request.description || ''}
						date={store.request.date}
						repliesCount={store.request.replies.length}
						amount={formatMoney(store.request.price ?? 0n)}
						user={{
							name: store.request.seeker?.address ?? '',
							reputation: Number(store.request.seeker?.reputation ?? 0),
						}}
					/>
				</div>
				<div
					style={{
						backgroundColor: getColor('white'),
						boxShadow: '0px 1px 0px #DFDFDF',
						borderTop: '1px dashed #DFDFDF',
						position: 'relative',
						marginLeft: 10,
						marginRight: 10,
					}}
				>
					{store.request.selectedReply &&
						(isSelectedReplyMyReply || isMyRequest) &&
						status !== Status.Done && (
							<>
								{showSelectProviderBtn && (
									<div
										style={{
											backgroundColor: getColor('white'),
											borderRadius: '50%',
											width: 37,
											height: 37,
											boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.25)',
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
											cursor: 'pointer',
											marginLeft: 30,
											marginTop: 30,
										}}
									>
										<IconButton
											variant="back"
											onClick={() => setSelectedReply(undefined)}
										/>
									</div>
								)}

								<ReplyUI selected reply={store.request.selectedReply} />

								{/* Show select provider button */}
								{showSelectProviderBtn && (
									<div
										style={{
											padding: 30,
											backgroundColor: getColor('white'),
											width: '100%',
										}}
									>
										<Button
											size="large"
											onClick={selectProvider}
											disabled={loadingSelectProvider}
										>
											select {formatName(store.request.selectedReply.user)}
										</Button>
									</div>
								)}

								{status === Status.Open &&
									isMyRequest &&
									selectedProvider.data && (
										<div
											style={{
												backgroundColor: getColor('blue'),
												padding: 30,
												display: 'flex',
												flexDirection: 'column',
												alignItems: 'center',
												justifyContent: 'center',
												textAlign: 'center',
											}}
										>
											<Typography variant="body-bold-16" color="white">
												You selected{' '}
												{formatName(store.request.selectedReply.user)} to make a
												deal.
											</Typography>
											<Typography variant="small-light-12" color="white">
												Waiting for{' '}
												{formatName(store.request.selectedReply.user)} to
												respond
											</Typography>
											<Button style={{ marginTop: 30 }} size="large">
												unselect {formatName(store.request.selectedReply.user)}
											</Button>
										</div>
									)}
							</>
						)}

					{status === Status.Done &&
						store.request.seeker &&
						store.request.provider &&
						store.user && (
							<div
								style={{
									padding: 30,
									display: 'flex',
									flexDirection: 'column',
								}}
							>
								<Typography variant="small-light-12" color="grey2-light-text">
									{new Date().toLocaleDateString()}
								</Typography>
								<Typography
									variant="body-bold-16"
									style={{ marginBottom: 20, marginTop: 10 }}
								>
									This deal has been completed.
								</Typography>
								<PaymentDetail
									seeker={store.request.seeker}
									provider={store.request.provider}
									user={store.user}
									marketplace={store.marketplace.name ?? ''}
									amount={formatMoney(store.request.price ?? 0n)}
									reputation={0}
								/>
								<Typography
									color="blue"
									variant="small-bold-12"
									style={{ marginTop: 40, textDecoration: 'underline' }}
								>
									see this on ethplorer
								</Typography>
							</div>
						)}

					{status === Status.Funded && !isSelectedReplyMyReply && !isMyRequest && (
						<div style={{ padding: 30, textAlign: 'center' }}>
							{store.request.myReply && (
								<>
									<Typography variant="body-light-16">
										{store.request.seeker?.address} selected
									</Typography>{' '}
									<Typography variant="body-bold-16">
										a different provider.
									</Typography>
								</>
							)}
							{!store.request.myReply && (
								<>
									<Typography variant="body-light-16">
										{store.request.seeker?.address} already selected
									</Typography>{' '}
									<Typography variant="body-bold-16">a provider.</Typography>
								</>
							)}
						</div>
					)}

					{status === Status.Open &&
						!isSelectedReplyMyReply &&
						!isMyRequest &&
						replies.length > 0 && (
							<>
								{store.request.replies.map((reply) => (
									<ReplyContainer
										key={reply.signature}
										reply={reply}
										isMyRequest={
											store.request.seeker?.address === store.user?.address
										}
										isMyReply={reply.from === store.user?.address}
										amount={formatMoney(store.request.price ?? 0n)}
										status={status}
										setSelectedReply={setSelectedReply}
									/>
								))}
							</>
						)}

					{!store.request.selectedReply && replies.length === 0 && !isReplying && (
						<div style={{ padding: 30, textAlign: 'center' }}>
							<Typography variant="small-light-12" color="grey2-light-text">
								No replies yet.
							</Typography>
						</div>
					)}

					{status === Status.Open && !isMyRequest && isReplying && (
						<div style={{ marginLeft: 30, marginRight: 0, marginBottom: 30 }}>
							<ReplyForm
								item={item}
								marketplace={id}
								decimals={decimals}
								onCancel={() => setIsReplying(false)}
							/>
						</div>
					)}

					{isSelectedReplyMyReply && status === Status.Open && (
						<FundDeal
							marketplace={id}
							item={itemId}
							data={selectedProvider.data}
							amount={formatMoney(store.request.price ?? 0n)}
							fee={formatMoney(store.request.fee?.toBigInt() ?? 0n)}
						/>
					)}
					{isMyRequest && status === Status.Funded && (
						<PayoutItem
							marketplace={id}
							item={itemId}
							amount={formatMoney(store.request.price ?? 0n)}
							user={store.request.seeker?.address ?? 'unknown'}
						/>
					)}
					{isSelectedReplyMyReply && status === Status.Funded && <InDeal />}
					{status === Status.Open &&
						!isMyRequest &&
						!isReplying &&
						!store.request.myReply && (
							<div
								style={{
									position: 'absolute',
									bottom: -30,
									right: 46,
								}}
							>
								<IconButton
									variant="reply"
									onClick={() => {
										setIsReplying(true)
									}}
								/>
							</div>
						)}
				</div>

				{isMyRequest && status === Status.Open && (
					<div
						style={{ marginTop: 58, display: 'flex', justifyContent: 'center' }}
					>
						<Button variant="danger" onClick={cancel} disabled={!canCancel}>
							cancel this request
						</Button>
					</div>
				)}
				{(isMyRequest || isSelectedReplyMyReply) && status === Status.Funded && (
					<div
						style={{ marginTop: 40, display: 'flex', justifyContent: 'center' }}
					>
						<Button>start conflict</Button>
					</div>
				)}
			</div>
		</Container>
	)
}
