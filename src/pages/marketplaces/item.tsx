import { formatUnits } from '@ethersproject/units'
import { FormEvent, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAccount, useNetwork } from 'wagmi'
import { hexlify } from '@ethersproject/bytes'
import { getAddress } from '@ethersproject/address'

// Hooks
import { useWaku } from '../../hooks/use-waku'

// Services
import {
	useMarketplaceItem,
	useMarketplaceName,
	useMarketplaceProviderReputation,
	useMarketplaceTokenDecimals,
	useMarketplaceTokenName,
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
} from '@swarm-city/ui-library'
import { useStore } from '../../store'
import { Container } from '../../ui/container'
import { Typography } from '../../ui/typography'
import { getColor } from '../../ui/colors'
import { Reply as ReplyUI } from '../../ui/components/reply'
import { amountToString, formatName, tokenToDecimals } from '../../ui/utils'
import { Reply, User } from '../../ui/types'
import { ErrorModal } from '../../ui/components/error-modal'
import { InDeal } from '../../ui/components/in-deal'
import { PaymentDetail } from '../../ui/components/payment-detail'
import { Avatar } from '../../ui/avatar'
import { Request } from '../../ui/components/request'
import { UserAccount } from './user-account'
import { LOGIN } from '../../routes'
import { Chat } from '../../containers/chat'
import { StartConflictContainer } from '../../containers/start-conflict'
import { InConflict } from '../../containers/in-conflict'
import { ConflictResolutionDetail } from '../../ui/components/conflict-resolution-detail'

// Protos
import { KeyExchange } from '../../protos/key-exchange'

type ReplyFormProps = {
	item: Item
	marketplace: string
	decimals: number | undefined
	hideForm: () => void
}

const ReplyForm = ({
	item,
	marketplace,
	decimals,
	hideForm,
}: ReplyFormProps) => {
	const [text, setText] = useState('')
	const [profile] = useStore.profile()
	const [error, setError] = useState<Error | undefined>()
	const [loading, setLoading] = useState(false)

	const { waku, waiting } = useWaku()
	const { connector } = useAccount()
	const tokenName = useMarketplaceTokenName(marketplace)

	const postReply = async (event: FormEvent<HTMLElement>) => {
		event.preventDefault()

		if (!waku || !connector) {
			setError(new Error('no waku or connector'))
			return
		}

		try {
			const signer = await connector.getSigner()
			setLoading(true)
			await createReply(waku, marketplace, item.id, { text }, signer)
			setText('')
		} catch (err) {
			console.error(err)
			setError(err as Error)
		}
		hideForm()
		setLoading(false)
	}

	if (error) {
		return <ErrorModal onClose={() => setError(undefined)} />
	}

	if (loading) {
		return (
			<FullscreenLoading>
				<Typography variant="header-35">Posting your reply.</Typography>
			</FullscreenLoading>
		)
	}

	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
			}}
		>
			<div
				style={{
					display: 'flex',
					flexDirection: 'row',
					alignItems: 'center',
				}}
			>
				<Avatar
					size={40}
					avatar={profile?.avatar}
					style={{
						marginRight: 12,
					}}
				/>
				<div
					style={{
						display: 'flex',
						flexDirection: 'column',
						textAlign: 'left',
						flexGrow: 1,
					}}
				>
					<div style={{ marginTop: 40 }}>
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
							: `for ${formatUnits(item.price, decimals)} ${tokenName}.`}
					</Typography>
				</div>
			</div>
			<div
				style={{
					marginTop: 26,
					display: 'flex',
					flexDirection: 'row',
					justifyContent: 'center',
					alignItems: 'center',
				}}
			>
				<IconButton
					variant="cancel"
					onClick={hideForm}
					style={{ marginRight: 15 }}
				/>
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
	tokenName,
	marketplace,
}: {
	reply: ItemReplyClean
	isMyReply: boolean
	isMyRequest: boolean
	status?: Status
	setSelectedReply: (reply: Reply | undefined) => void
	amount: number
	tokenName?: string
	marketplace: string
}) => {
	const navigate = useNavigate()

	// Profile
	const { profile } = useProfile(replyItem.from)
	const avatar = useProfilePictureURL(profile?.pictureHash)
	const reputation = useMarketplaceProviderReputation(
		marketplace,
		replyItem.from
	)

	const user: User = {
		name: profile?.username,
		address: replyItem.from,
		reputation: reputation?.toBigInt() ?? 0n,
		avatar,
	}

	const reply: Reply = {
		text: replyItem.text,
		date: new Date(),
		amount,
		isMyReply,
		user,
		tokenName,
		keyExchange: replyItem.keyExchange,
	}

	return (
		<ReplyUI
			reply={reply}
			onSelectClick={() => setSelectedReply(reply)}
			showSelectBtn={status === Status.Open && isMyRequest}
			onClickUser={(user) => navigate(`/user/${user.address}`)}
		/>
	)
}

const PayoutItem = ({
	marketplace,
	item,
	amount,
	user,
	seeker,
	provider,
}: {
	marketplace: string
	item: bigint
	amount: number
	user: User
	seeker: User
	provider: User
}) => {
	const { connector } = useAccount()
	const tokenName = useMarketplaceTokenName(marketplace)

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

		setSuccess(false)

		try {
			const signer = await connector.getSigner()
			setLoading(true)
			await payoutItem(signer, marketplace, item)
			setSuccess(true)
		} catch (err) {
			console.error(err)
			setError(err as Error)
		}
		setLoading(false)
	}

	if (error) {
		return <ErrorModal onClose={() => setError(undefined)} />
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
						You're about to pay {amountToString(amount)} {tokenName} to{' '}
						{formatName(provider)}.
					</>
				</Typography>
				<div style={{ paddingTop: 30 }}>
					<Typography variant="small-light-12">
						This can not be undone.
					</Typography>
				</div>
			</ConfirmModal>
		)
	}

	return (
		<InDeal chat={<Chat user={user} seeker={seeker} provider={provider} />}>
			<Button
				style={{ marginTop: 30 }}
				size="large"
				color="green-light"
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
	seeker,
	keyExchange,
}: {
	data?: SelectProvider
	marketplace: string
	item: bigint
	amount: number
	fee: number
	seeker: User
	keyExchange: KeyExchange
}) => {
	const { connector } = useAccount()
	const tokenName = useMarketplaceTokenName(marketplace)

	// State
	const [loading, setLoading] = useState<string | undefined>(undefined)
	const [error, setError] = useState<Error>()
	const [showFundConfirm, setShowFundConfirm] = useState(false)
	const [showRejectConfirm, setShowRejectConfirm] = useState(false)

	// Fund function
	const canFund = connector && data?.signature
	const fund = async () => {
		if (!canFund) {
			return
		}

		try {
			const signer = await connector.getSigner()
			setLoading('Funding is being processed')
			setShowFundConfirm(false)
			await fundItem(signer, marketplace, item, data.signature, keyExchange)
		} catch (err) {
			console.error(err)
			setError(err as Error)
		}
		setLoading(undefined)
	}

	const rejectDeal = async () => {
		if (!connector) {
			return
		}

		try {
			const signer = await connector.getSigner()
			setLoading('Declining the deal')
			setShowRejectConfirm(false)

			// FIXME: Something should actually happen here
			const sleep = (time: number): Promise<void> =>
				new Promise((resolve) => setTimeout(() => resolve(), time))
			await sleep(2000)
			console.log(signer.address)
		} catch (err) {
			console.error(err)
			setError(err as Error)
		}
		setLoading(undefined)
	}

	if (error) {
		return <ErrorModal onClose={() => setError(undefined)} />
	}

	if (loading) {
		return (
			<FullscreenLoading>
				<Typography variant="header-35">{loading}.</Typography>
			</FullscreenLoading>
		)
	}

	if (showFundConfirm) {
		return (
			<ConfirmModal
				variant="action"
				confirm={{ onClick: fund }}
				cancel={{ onClick: () => setShowFundConfirm(false) }}
			>
				<Typography variant="header-35">
					<>
						You're about to fund this deal with {amountToString(amount + fee)}{' '}
						{tokenName}.
					</>
				</Typography>
				<div style={{ paddingTop: 30 }}>
					<Typography variant="small-light-12">
						This can not be undone.
					</Typography>
				</div>
				<div>
					<Typography variant="small-light-12">
						<>
							{amountToString(fee)} {tokenName} fee is included.
						</>
					</Typography>
				</div>
			</ConfirmModal>
		)
	}

	if (showRejectConfirm) {
		return (
			<ConfirmModal
				variant="danger"
				confirm={{ onClick: rejectDeal }}
				cancel={{ onClick: () => setShowRejectConfirm(false) }}
			>
				<Typography variant="header-35">Decline this deal?</Typography>
				<div style={{ paddingTop: 30 }}>
					<Typography variant="small-light-12">
						This can not be undone. {formatName(seeker)} will be notified that
						you do not want to accept this deal. Your reply will be removed.
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
					<IconButton
						variant="cancel"
						style={{ marginRight: 15 }}
						onClick={() => setShowRejectConfirm(true)}
					/>
					<IconButton
						variant="confirmAction"
						onClick={() => setShowFundConfirm(true)}
					/>
				</div>
			</div>
		</>
	)
}

const SelectProviderContainer = ({ provider }: { provider: User }) => {
	const [isLoading, setIsLoading] = useState(false)
	const [showConfirm, setShowConfirm] = useState(false)
	const [error, setError] = useState<Error | undefined>()
	const { waku } = useWaku()
	const { connector } = useAccount()

	const unselectProvider = async () => {
		try {
			if (!waku || !connector) {
				return
			}
			const signer = await connector.getSigner()
			setIsLoading(true)
			setShowConfirm(false)

			// FIXME: Something should actually happen here
			const sleep = (time: number): Promise<void> =>
				new Promise((resolve) => setTimeout(() => resolve(), time))
			await sleep(2000)
			console.log(signer.address)
		} catch (error) {
			console.error(error)
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
				<Typography variant="header-35">Unselecting provider.</Typography>
			</FullscreenLoading>
		)
	}
	if (showConfirm) {
		return (
			<ConfirmModal
				confirm={{ onClick: unselectProvider }}
				cancel={{ onClick: () => setShowConfirm(false) }}
				variant="danger"
			>
				<Typography variant="header-35" color="white">
					Unselect {formatName(provider)} from this deal?
				</Typography>
			</ConfirmModal>
		)
	}

	return (
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
				You selected {formatName(provider)} to make a deal.
			</Typography>
			<Typography variant="small-light-12" color="white">
				Waiting for {formatName(provider)} to respond
			</Typography>
			<Button
				style={{ marginTop: 30 }}
				size="large"
				color="blue-light"
				bg
				onClick={() => setShowConfirm(true)}
			>
				unselect {formatName(provider)}
			</Button>
		</div>
	)
}

interface CancelRequestProps {
	marketplaceId: string
	itemId: bigint
}
const CancelRequestContainer = ({
	marketplaceId,
	itemId,
}: CancelRequestProps) => {
	const [isLoading, setIsLoading] = useState(false)
	const [showConfirm, setShowConfirm] = useState(false)
	const [error, setError] = useState<Error | undefined>()
	const { connector } = useAccount()
	const navigate = useNavigate()

	const canCancel = connector
	const cancel = async () => {
		try {
			if (!canCancel) {
				throw new Error('no connector')
			}

			const signer = await connector.getSigner()
			setIsLoading(true)

			await cancelItem(signer, marketplaceId, itemId)
			navigate(`/marketplace/${marketplaceId}`)
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
				<Typography variant="header-35">Request is being canceled.</Typography>
			</FullscreenLoading>
		)
	}
	if (showConfirm) {
		return (
			<ConfirmModal
				confirm={{ onClick: cancel }}
				cancel={{ onClick: () => setShowConfirm(false) }}
				variant="danger"
			>
				<Typography variant="header-35" color="white">
					Cancel this request?
				</Typography>
				<div style={{ paddingTop: 30 }}>
					<Typography variant="small-light-12">
						This can not be undone.
					</Typography>
				</div>
			</ConfirmModal>
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
			<Button
				color="red"
				onClick={() => setShowConfirm(true)}
				disabled={!canCancel}
			>
				cancel this request
			</Button>
		</div>
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
	const tokenName = useMarketplaceTokenName(id)
	const [isReplying, setIsReplying] = useState<boolean>(false)
	const [error, setError] = useState<Error | undefined>()

	// TODO: Replace this with a function that only fetches the appropriate item
	const { loading, waiting, items, lastUpdate } = useMarketplaceItems(id)
	const item = useMemo(() => {
		return items.find(({ id }) => id.eq(itemId))
	}, [lastUpdate])

	const [selectedReply, setSelectedReply] = useState<Reply | undefined>()

	const selectedReplyItemClean = replies.find((r) => r.from === provider)
	const seekerProfile = useProfile(item?.owner)
	const seekerAvatar = useProfilePictureURL(seekerProfile.profile?.pictureHash)
	const seeker: User | undefined = item?.owner
		? {
				address: item.owner,
				reputation: item?.seekerRep.toBigInt() ?? 0n,
				name: seekerProfile.profile?.username,
				avatar: seekerAvatar,
		  }
		: undefined

	const providerProfile = useProfile(chainItem.item?.providerAddress)
	const providerAvatar = useProfilePictureURL(
		providerProfile.profile?.pictureHash
	)
	const providerUser: User | undefined =
		chainItem.item?.providerAddress &&
		chainItem.item.providerAddress !==
			'0x0000000000000000000000000000000000000000'
			? {
					address: chainItem.item.providerAddress,
					reputation: chainItem.item?.providerRep ?? 0n,
					name: providerProfile.profile?.username,
					avatar: providerAvatar,
			  }
			: undefined

	const selectedProviderProfile = useProfile(provider)
	const selectedProviderAvatar = useProfilePictureURL(
		selectedProviderProfile.profile?.pictureHash
	)
	const selectedProviderReputation = useMarketplaceProviderReputation(
		id,
		provider
	)
	const selectedProviderUser: User | undefined = provider
		? {
				address: provider,
				reputation: selectedProviderReputation?.toBigInt() ?? 0n,
				name: selectedProviderProfile.profile?.username,
				avatar: selectedProviderAvatar,
		  }
		: undefined

	const userProfile = useProfile(address)
	const userAvatar = useProfilePictureURL(userProfile.profile?.pictureHash)
	const user: User | undefined = address
		? {
				address: address,
				reputation: 0n,
				name: userProfile.profile?.username,
				avatar: userAvatar,
		  }
		: undefined

	const marketplaceOwner = {
		address: '0x0000',
		name: 'Baby Yoda',
		avatar:
			'https://c4.wallpaperflare.com/wallpaper/525/380/968/the-mandalorian-baby-yoda-hd-wallpaper-preview.jpg',
		reputation: 9000n,
	}

	const store = {
		marketplace: {
			id,
			name,
			decimals,
			tokenName,
			//FIXME: this should com from contract
			owner: marketplaceOwner,
		},
		request: {
			id: itemId,
			price: item?.price,
			description: item?.metadata.description,
			date: item?.timestamp
				? new Date(item.timestamp.toNumber() * 1000)
				: new Date(),
			status: chainItem.item?.status,
			fee: item?.fee,
			myReply: replies.find((r) => r.from === address),
			selectedReply: selectedReply
				? selectedReply
				: selectedReplyItemClean &&
				  ({
						text: selectedReplyItemClean.text,
						date: new Date(),
						amount: tokenToDecimals(item?.price || 0n),
						isMyReply: address === selectedReplyItemClean.from,
						user: selectedProviderUser,
						tokenName,
				  } as Reply), // FIXME: this should not be typecasted
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
		try {
			if (!waku || !connector || !chain?.id || !name || !selectedReply) {
				return
			}

			const signer = await connector.getSigner()

			setLoadingSelectProvider(true)

			await createSelectProvider(
				waku,
				signer,
				{
					marketplace: {
						address: id,
						chainId: BigInt(chain.id),
						name,
					},
					provider: selectedReply?.user.address,
					item: itemId,
				},
				selectedReply.keyExchange
			)
		} catch (error) {
			console.error(error)
			setError(error as Error)
		}

		setLoadingSelectProvider(false)
	}

	if (!item || !chainItem.item || !store.request.seeker) {
		const text =
			loading || waiting || chainItem.loading
				? 'Loading...'
				: 'Item not found...'

		return (
			<div
				style={{
					backgroundColor: getColor('grey1'),
					width: '100vw',
					height: '100vh',
					overflowY: 'scroll',
					overflowX: 'hidden',
				}}
			>
				<UserAccount />
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
			</div>
		)
	}

	if (error) {
		return <ErrorModal onClose={() => setError(undefined)} />
	}

	if (loadingSelectProvider) {
		return (
			<FullscreenLoading>
				<Typography variant="header-35">
					Provider selection is being processed.
				</Typography>
			</FullscreenLoading>
		)
	}

	const isSelectedReplyMyReply =
		store.user?.address &&
		store.request.selectedReply?.user?.address === store.user?.address
	const isMyRequest =
		store.user?.address && store.request.seeker?.address === store.user?.address
	const isMarketplaceOwner =
		store.user?.address &&
		store.marketplace.owner?.address === store.user?.address
	const showSelectProviderBtn =
		store.request.status === Status.Open && !selectedProvider.data

	return (
		<div
			style={{
				backgroundColor: getColor('grey1'),
				width: '100vw',
				height: '100vh',
				overflow: 'hidden',
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'stretch',
			}}
		>
			<UserAccount />
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
			<div
				style={{
					flexGrow: 1,
					overflowY: 'auto',
					overflowX: 'hidden',
					marginTop: 22,
				}}
			>
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
						<div
							style={{
								backgroundColor: getColor('white'),
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
							<Request
								detail
								title={store.request.description || ''}
								date={store.request.date}
								amount={tokenToDecimals(store.request.price ?? 0n)}
								seeker={store.request.seeker}
								onClickUser={(user) => navigate(`/user/${user.address}`)}
								tokenName={store.marketplace.tokenName}
								isMyListing={item.owner === address}
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
								store.request.status &&
								![Status.Done, Status.Resolved].includes(
									store.request.status
								) &&
								(isSelectedReplyMyReply ||
									isMyRequest ||
									(isMarketplaceOwner &&
										store.request.status === Status.Disputed)) && (
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
													marginRight: 2,
													marginBottom: 2,
												}}
											>
												<IconButton
													variant="back"
													onClick={() => setSelectedReply(undefined)}
												/>
											</div>
										)}

										<ReplyUI
											selected
											reply={store.request.selectedReply}
											onClickUser={(user) => navigate(`/user/${user.address}`)}
										/>

										{/* Show select provider button */}
										{showSelectProviderBtn && (
											<div
												style={{
													padding: 30,
													backgroundColor: getColor('white'),
													display: 'flex',
													justifyContent: 'center',
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

										{store.request.status === Status.Open &&
											isMyRequest &&
											selectedProvider.data && (
												<SelectProviderContainer
													provider={store.request.selectedReply.user}
												/>
											)}
									</>
								)}

							{store.request.status === Status.Done &&
								store.request.seeker &&
								store.request.provider && (
									<div
										style={{
											padding: 30,
											display: 'flex',
											flexDirection: 'column',
										}}
									>
										<Typography
											variant="small-light-12"
											color="grey2-light-text"
										>
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
											amount={tokenToDecimals(store.request.price ?? 0n)}
											reputation={5}
											tokenName={store.marketplace.tokenName}
										/>
									</div>
								)}

							{store.request.status === Status.Resolved &&
								store.request.seeker &&
								store.request.provider &&
								store.marketplace.owner && (
									<div
										style={{
											padding: 30,
											display: 'flex',
											flexDirection: 'column',
											textAlign: 'center',
										}}
									>
										<Typography
											variant="small-light-12"
											color="grey2-light-text"
										>
											{new Date().toLocaleDateString()}
										</Typography>
										<Typography
											variant="body-bold-16"
											style={{ marginBottom: 20, marginTop: 10 }}
										>
											Conflict resolved.
										</Typography>
										<ConflictResolutionDetail
											seeker={store.request.seeker}
											provider={store.request.provider}
											user={store.user}
											marketplaceOwner={store.marketplace.owner}
											amountPaidProvider={0}
											amountPaidSeeker={0}
											tokenName={store.marketplace.tokenName}
										/>
									</div>
								)}

							{store.request.status === Status.Funded &&
								!isSelectedReplyMyReply &&
								!isMyRequest && (
									<div style={{ padding: 30, textAlign: 'center' }}>
										{store.request.myReply && (
											<>
												<Typography variant="body-light-16">
													{formatName(store.request.seeker)} selected
												</Typography>{' '}
												<Typography variant="body-bold-16">
													a different provider.
												</Typography>
											</>
										)}
										{!store.request.myReply && (
											<>
												<Typography variant="body-light-16">
													{formatName(store.request.seeker)} already selected
												</Typography>{' '}
												<Typography variant="body-bold-16">
													a provider.
												</Typography>
											</>
										)}
									</div>
								)}

							{store.request.status === Status.Open &&
								!isSelectedReplyMyReply &&
								!selectedReply &&
								(!selectedProvider.data || !isMyRequest) &&
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
												amount={tokenToDecimals(store.request.price ?? 0n)}
												status={store.request.status}
												setSelectedReply={setSelectedReply}
												tokenName={store.marketplace.tokenName}
												marketplace={id}
											/>
										))}
									</>
								)}

							{!store.request.selectedReply &&
								replies.length === 0 &&
								!isReplying && (
									<div style={{ padding: 30, textAlign: 'center' }}>
										<Typography
											variant="small-light-12"
											color="grey2-light-text"
										>
											No replies yet.
										</Typography>
									</div>
								)}

							{store.request.status === Status.Open &&
								!isMyRequest &&
								isReplying &&
								!store.request.myReply && (
									<div
										style={{
											marginLeft: 30,
											marginRight: 30,
											marginBottom: 30,
										}}
									>
										<ReplyForm
											item={item}
											marketplace={id}
											decimals={decimals}
											hideForm={() => setIsReplying(false)}
										/>
									</div>
								)}

							{isSelectedReplyMyReply &&
								store.request.status === Status.Open && (
									<FundDeal
										marketplace={id}
										item={itemId}
										data={selectedProvider.data}
										amount={tokenToDecimals(store.request.price ?? 0n)}
										fee={tokenToDecimals(store.request.fee?.toBigInt() ?? 0n)}
										seeker={store.request.seeker}
										keyExchange={item.metadata.keyExchange}
									/>
								)}
							{isMyRequest &&
								store.request.status === Status.Funded &&
								store.request.provider &&
								store.request.seeker &&
								store.user && (
									<PayoutItem
										marketplace={id}
										item={itemId}
										amount={tokenToDecimals(store.request.price ?? 0n)}
										user={store.user}
										provider={store.request.provider}
										seeker={store.request.seeker}
									/>
								)}
							{isSelectedReplyMyReply &&
								store.request.status === Status.Funded &&
								store.user &&
								store.request.seeker &&
								store.request.provider && (
									<InDeal
										chat={
											<Chat
												user={store.user}
												seeker={store.request.seeker}
												provider={store.request.provider}
											/>
										}
									/>
								)}
							{store.request.status === Status.Open &&
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
											onClick={() =>
												user?.address ? setIsReplying(true) : navigate(LOGIN)
											}
										/>
									</div>
								)}
						</div>
						{store.request.status === Status.Disputed &&
							store.request.provider &&
							store.request.price &&
							store.marketplace.tokenName && (
								<div
									style={{
										backgroundColor: getColor('white'),
										boxShadow: '0px 1px 0px #DFDFDF',
										marginLeft: 10,
										marginRight: 10,
										marginBottom: 50,
									}}
								>
									<InConflict
										chat={
											(isMyRequest ||
												isSelectedReplyMyReply ||
												isMarketplaceOwner) &&
											store.user ? (
												<Chat
													user={store.user}
													seeker={store.request.seeker}
													provider={store.request.provider}
												/>
											) : null
										}
										user={store.user}
										marketplaceOwner={store.marketplace.owner}
										provider={store.request.provider}
										seeker={store.request.seeker}
										amount={store.request.price.toBigInt()}
										tokenName={store.marketplace.tokenName}
									/>
								</div>
							)}

						{isMyRequest && store.request.status === Status.Open && (
							<CancelRequestContainer
								marketplaceId={store.marketplace.id}
								itemId={store.request.id}
							/>
						)}
						{(isMyRequest || isSelectedReplyMyReply) &&
							store.request.status === Status.Funded &&
							typeof store.request.description === 'string' && (
								<StartConflictContainer
									description={store.request.description}
									marketplaceName={store.marketplace.name}
									marketplaceId={store.marketplace.id}
									itemId={store.request.id}
								/>
							)}
					</div>
				</Container>
			</div>
		</div>
	)
}
