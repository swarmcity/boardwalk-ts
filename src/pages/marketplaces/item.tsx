import { formatUnits } from '@ethersproject/units'
import { FormEvent, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { useAccount, useNetwork } from 'wagmi'
import { hexlify } from '@ethersproject/bytes'
import { getAddress } from '@ethersproject/address'

// Hooks
import { useWaku } from '../../hooks/use-waku'

// Lib
import { formatFrom } from '../../lib/tools'

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
import { SelectProvider } from '../../protos/SelectProvider'
import {
	Button,
	IconButton,
	Input,
	Reply as ReplyUI,
	RequestItem,
} from '@swarm-city/ui-library'
import { useStore } from '../../store'
import { Container } from '../../ui/container'
import { Typography } from '../../ui/typography'
import { getColor } from '../../ui/colors'

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

	const { waku, waiting } = useWaku()
	const { connector } = useAccount()

	const postReply = async (event: FormEvent<HTMLElement>) => {
		event.preventDefault()

		if (!waku || !connector) {
			throw new Error('no waku or connector')
		}

		await createReply(waku, marketplace, item.id, { text }, connector)
		setText('')
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

const Reply = ({
	reply,
	ownItem,
	marketplace,
	item,
	canSelectProvider,
}: {
	reply: ItemReplyClean
	ownItem: boolean
	marketplace: string
	item: bigint
	canSelectProvider: boolean
}) => {
	const { waku, waiting } = useWaku()

	// Wagmi
	const { connector } = useAccount()
	const { chain } = useNetwork()

	// Marketplace
	const name = useMarketplaceName(marketplace)

	// Profile
	const { profile } = useProfile(reply.from)
	const avatar = useProfilePictureURL(profile?.pictureHash)

	// State
	const [loading, setLoading] = useState(false)
	const [selected, setSelected] = useState(false)
	const [showSelectBtn, setShowSelectBtn] = useState(false)

	const selectProvider = async () => {
		if (!waku || !connector || !chain?.id || !name) {
			return
		}

		setLoading(true)

		await createSelectProvider(waku, connector, {
			marketplace: {
				address: marketplace,
				chainId: BigInt(chain.id),
				name,
			},
			provider: reply.from,
			item,
		})

		setSelected(true)
		setLoading(false)
	}
	if (loading) return <span>Loading...</span>

	return (
		<>
			{/* TODO: fix this in the component itself, this is very temporary */}
			{canSelectProvider && !showSelectBtn && (
				<div style={{ position: 'relative', width: '100%' }}>
					<div style={{ position: 'absolute', right: 0, top: 5 }}>
						<IconButton
							variant="select"
							style={{ backgroundColor: 'white', border: 'solid 1px black' }}
							onClick={() => {
								setShowSelectBtn(true)
							}}
						/>
					</div>
				</div>
			)}
			{canSelectProvider && showSelectBtn && !selected && (
				<div style={{ position: 'relative', width: '100%' }}>
					<IconButton
						variant="select"
						style={{
							backgroundColor: 'white',
							border: 'solid 1px black',
							transform: 'rotate(180deg)',
						}}
						onClick={() => {
							setShowSelectBtn(false)
						}}
					/>
				</div>
			)}
			<ReplyUI
				replyTitle={reply.text}
				replyDate={new Date()}
				replierName={formatFrom(reply.from, profile?.username)}
				avatar={avatar}
				replierRep={0}
				replyAmt={0}
				myReply={ownItem}
				detail
			/>
			{showSelectBtn && !selected && (
				<Button size="large" onClick={selectProvider} disabled={waiting}>
					select {formatFrom(reply.from, profile?.username)}
				</Button>
			)}
			{showSelectBtn && selected && (
				<div
					style={{
						backgroundColor: getColor('blue'),
						padding: 10,
						display: 'flex',
						flexDirection: 'column',
						justifyContent: 'center',
						width: '100%',
					}}
				>
					<Typography variant="body-bold-16" color="white">
						You selected {formatFrom(reply.from, profile?.username)} to make a
						deal
					</Typography>
					<Typography variant="small-light-12" color="white">
						Waiting for {formatFrom(reply.from, profile?.username)} to respond
					</Typography>
					<Button size="large" variant="action" onClick={selectProvider}>
						unselect {formatFrom(reply.from, profile?.username)}
					</Button>
				</div>
			)}
		</>
	)
}

const SelectedProvider = ({
	data,
	lastUpdate,
}: {
	data: SelectProvider
	lastUpdate: number
}) => {
	const provider = useMemo(() => hexlify(data.provider), [lastUpdate])
	const { profile } = useProfile(hexlify(provider))
	return <div>Provider selected: {formatFrom(provider, profile?.username)}</div>
}

const PayoutItem = ({
	marketplace,
	item,
}: {
	marketplace: string
	item: bigint
}) => {
	const { connector } = useAccount()

	// State
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<Error>()
	const [success, setSuccess] = useState(false)

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
		}
	}

	return (
		<div>
			<button onClick={payout} disabled={loading || success}>
				{success ? 'Success!' : 'Payout the deal'}
			</button>
			{JSON.stringify(error)}
		</div>
	)
}

// TODO: Make `data` not optional, as this component should only
// ever be displayed if we actually have all the required data.
const FundDeal = ({
	data,
	marketplace,
	item,
}: {
	data?: SelectProvider
	marketplace: string
	item: bigint
}) => {
	const { connector } = useAccount()

	// State
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<Error>()
	const [success, setSuccess] = useState(false)

	// Fund function
	const canFund = connector && data?.signature
	const fund = async () => {
		if (!canFund) {
			return
		}

		setLoading(true)
		setSuccess(false)

		try {
			await fundItem(connector, marketplace, item, data?.signature)
			setSuccess(true)
			setError(undefined)
		} catch (err) {
			console.error(err)
			setError(err as Error)
		} finally {
			setLoading(false)
		}
	}

	return (
		<div>
			<p>You're the provider!</p>
			<button onClick={fund} disabled={loading || success || !canFund}>
				{success ? 'Success!' : 'Fund the deal'}
			</button>
			{JSON.stringify(error)}
		</div>
	)
}

export const MarketplaceItem = () => {
	const { id, item: itemIdString } = useParams<{ id: string; item: string }>()
	if (!id || !itemIdString) {
		throw new Error('no id or item')
	}

	const itemId = BigInt(itemIdString)

	const { address } = useAccount()
	const { decimals } = useMarketplaceTokenDecimals(id)
	const { connector } = useAccount()
	const navigate = useNavigate()
	const { replies } = useItemReplies(id, itemId)
	const selectedProvider = useSelectProvider(id, itemId)
	const provider = useMemo(() => {
		const address = selectedProvider.data?.provider
		return address && getAddress(hexlify(address))
	}, [selectedProvider.lastUpdate])

	const chainItem = useMarketplaceItem(id, itemId)
	const [isReplying, setIsReplying] = useState<boolean>(false)
	const name = useMarketplaceName(id)

	// TODO: Replace this with a function that only fetches the appropriate item
	const { loading, waiting, items, lastUpdate } = useMarketplaceItems(id)
	const item = useMemo(() => {
		return items.find(({ id }) => id.eq(itemId))
	}, [lastUpdate])

	if (!item || !chainItem.item) {
		const text =
			loading || waiting || chainItem.loading
				? 'Loading...'
				: 'Item not found...'

		return (
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					flexDirection: 'column',
					textAlign: 'left',
					width: '100%',
				}}
			>
				<div style={{ maxWidth: 1000, width: '100%', textAlign: 'left' }}>
					<div
						style={{
							flexGrow: 1,
							marginLeft: 40,
							marginRight: 40,
							width: '100%',
						}}
					>
						<h2
							style={{
								fontFamily: 'Montserrat',
								fontStyle: 'normal',
								fontWeight: 700,
								fontSize: 28,
								color: '#333333',
							}}
						>
							{text}
						</h2>
					</div>
				</div>
			</div>
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

	return (
		<>
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					flexDirection: 'column',
					textAlign: 'left',
				}}
			>
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
					<div
						style={{
							backgroundColor: '#FAFAFA',
							boxShadow: '0px 1px 0px #DFDFDF',
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
							title={item.metadata.description}
							date={new Date(item.timestamp * 1000)}
							repliesCount={0}
							amount={0}
							user={{
								name: item.owner.substring(0, 10),
								reputation: item.seekerRep.toNumber(),
							}}
						/>
						{selectedProvider.data && (
							<SelectedProvider
								{...selectedProvider}
								data={selectedProvider.data}
							/>
						)}

						{provider === address && status === Status.Open && (
							<FundDeal
								marketplace={id}
								item={itemId}
								data={selectedProvider.data}
							/>
						)}

						{chainItem.item.seekerAddress === address &&
							status === Status.Funded && (
								<PayoutItem marketplace={id} item={itemId} />
							)}

						<p>
							Status: {Statuses[status]} (
							{formatFrom(chainItem.item.providerAddress)})
						</p>
					</div>
					<div
						style={{
							backgroundColor: '#FAFAFA',
							boxShadow: '0px 1px 0px #DFDFDF',
							borderTop: '1px dashed #DFDFDF',
							position: 'relative',
							marginLeft: 10,
							marginRight: 10,
						}}
					>
						<div
							style={{
								padding: 30,
							}}
						>
							{replies.length ? (
								<>
									{replies.map((reply) => (
										<div
											key={reply.signature}
											style={{ width: '100%', marginBottom: 25 }}
										>
											<Reply
												reply={reply}
												ownItem={item.owner === address}
												canSelectProvider={
													status === Status.Open && item.owner === address
												}
												marketplace={id}
												item={itemId}
											/>
										</div>
									))}
								</>
							) : (
								!isReplying && (
									<div
										style={{
											textAlign: 'center',
											fontFamily: 'Montserrat',
											fontStyle: 'normal',
											fontWeight: 300,
											fontSize: 12,
											color: '#ACACAC',
										}}
									>
										No replies yet.
									</div>
								)
							)}
							{status === Status.Open &&
								item.owner !== address &&
								isReplying && (
									<ReplyForm
										item={item}
										marketplace={id}
										decimals={decimals}
										onCancel={() => setIsReplying(false)}
									/>
								)}
						</div>
						{status === Status.Open && item.owner !== address && !isReplying && (
							<div
								style={{
									position: 'absolute',
									bottom: -13,
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
				</Container>

				{status === Status.Open && item.owner === address && (
					<div style={{ marginTop: 58 }}>
						<Button variant="danger" onClick={cancel} disabled={!canCancel}>
							cancel this request
						</Button>
					</div>
				)}
			</div>
		</>
	)
}
