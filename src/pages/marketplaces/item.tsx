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
import { Button, IconButton, Input, RequestItem } from '@swarm-city/ui-library'
import { useStore } from '../../store'
import { Container } from '../../ui/container'
import { Typography } from '../../ui/typography'
import { getColor } from '../../ui/colors'
import { Reply as ReplyUI } from '../../ui/components/reply'
import { formatName } from '../../ui/utils'

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
	status,
}: {
	reply: ItemReplyClean
	ownItem: boolean
	marketplace: string
	item: bigint
	status: Status
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
	const [detailedView, setDetailedView] = useState(false)

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
	if (loading || waiting) return <span>Loading...</span>

	const user = {
		name: profile?.username,
		address: reply.from,
		reputation: 0,
		avatar,
	}

	return (
		<>
			{status === Status.Open && ownItem && detailedView && (
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
						marginBottom: 20,
					}}
				>
					<IconButton
						variant="select"
						onClick={() => setDetailedView(false)}
						style={{ transform: 'rotate(180deg)' }}
					/>
				</div>
			)}

			<ReplyUI
				title={reply.text}
				date={new Date()}
				amount={0}
				isMyReply={ownItem}
				onSelectClick={() => setDetailedView(true)}
				selected={detailedView}
				showSelectBtn={status === Status.Open && ownItem}
				user={user}
			/>

			{/* Show select provider button */}
			{detailedView && status === Status.Open && ownItem && !selected && (
				<div
					style={{
						padding: 30,
						backgroundColor: getColor('white'),
						width: '100%',
					}}
				>
					<Button size="large" onClick={selectProvider}>
						select {formatName(user)}
					</Button>
				</div>
			)}

			{/* Show unselect provider button */}
			{detailedView && status === Status.Open && ownItem && selected && (
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
						You selected {formatName(user)} to make a deal.
					</Typography>
					<Typography variant="small-light-12" color="white">
						Waiting for {formatName(user)} to respond
					</Typography>
					<Button style={{ marginTop: 30 }} size="large">
						unselect {formatName(user)}
					</Button>
				</div>
			)}

			{/* Show fund deal button*/}
			{detailedView && status === Status.Open && !ownItem && (
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
						<IconButton variant="confirmAction" />
					</div>
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
			<Container>
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
						backgroundColor: getColor('white'),
						boxShadow: '0px 1px 0px #DFDFDF',
						borderTop: '1px dashed #DFDFDF',
						position: 'relative',
						marginLeft: 10,
						marginRight: 10,
					}}
				>
					<>
						{replies.length ? (
							<>
								{replies.map((reply) => (
									<Reply
										reply={reply}
										key={reply.signature}
										ownItem={item.owner === address}
										marketplace={id}
										item={itemId}
										status={status}
									/>
								))}
							</>
						) : (
							!isReplying && (
								<Typography variant="small-light-12" color="grey2-light-text">
									No replies yet.
								</Typography>
							)
						)}
						{status === Status.Open && item.owner !== address && isReplying && (
							<div style={{ marginLeft: 30, marginRight: 0 }}>
								<ReplyForm
									item={item}
									marketplace={id}
									decimals={decimals}
									onCancel={() => setIsReplying(false)}
								/>
							</div>
						)}
					</>
					{status === Status.Open && item.owner !== address && !isReplying && (
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

				{status === Status.Open && item.owner === address && (
					<div
						style={{ marginTop: 58, display: 'flex', justifyContent: 'center' }}
					>
						<Button variant="danger" onClick={cancel} disabled={!canCancel}>
							cancel this request
						</Button>
					</div>
				)}
			</div>
		</Container>
	)
}
