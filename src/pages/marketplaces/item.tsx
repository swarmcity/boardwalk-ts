import { formatUnits } from '@ethersproject/units'
import { FormEvent, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { useAccount, useNetwork } from 'wagmi'
import { hexlify, splitSignature } from '@ethersproject/bytes'

// Hooks
import { useWaku, useWakuContext } from '../../hooks/use-waku'

// Lib
import { bufferToHex, displayAddress } from '../../lib/tools'

// Services
import {
	useMarketplaceContract,
	useMarketplaceItem,
	useMarketplaceName,
	useMarketplaceTokenContract,
	useMarketplaceTokenDecimals,
} from './services/marketplace'
import {
	createReply,
	ItemReplyClean,
	useItemReplies,
} from './services/marketplace-item'
import { Item, Status, useMarketplaceItems } from './services/marketplace-items'
import { useProfile } from '../../services/profile'
import { useProfilePicture } from '../../services/profile-picture'

// Assets
import avatarDefault from '../../assets/imgs/avatar.svg?url'

// Protos
import { ProfilePicture as ProfilePictureProto } from '../../protos/ProfilePicture'
import {
	createSelectProvider,
	useSelectProvider,
} from '../../services/select-provider'
import { SelectProvider } from '../../protos/SelectProvider'
import { getAddress } from '@ethersproject/address'

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
}

const ReplyForm = ({ item, marketplace, decimals }: ReplyFormProps) => {
	const [text, setText] = useState('')

	const { waku } = useWakuContext()
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
		<form onSubmit={postReply}>
			<input
				type="text"
				value={text}
				onChange={(event) => setText(event.currentTarget.value)}
			/>
			<p>
				{decimals === undefined
					? 'Loading...'
					: `For ${formatUnits(item.price, decimals)} DAI`}
			</p>
			<button type="submit">Submit</button>
		</form>
	)
}

const ProfilePicture = ({ picture }: { picture?: ProfilePictureProto }) => {
	const avatar = useMemo(() => {
		if (!picture) {
			return avatarDefault
		}

		const blob = new Blob([picture.data], { type: picture?.type })
		return URL.createObjectURL(blob)
	}, [picture])

	return <img src={avatar} />
}

const formatFrom = (address: string, username?: string) => {
	if (!username) {
		return displayAddress(address)
	}

	return `${username} (${displayAddress(address)})`
}

const Reply = ({
	reply,
	ownItem,
	marketplace,
	item,
}: {
	reply: ItemReplyClean
	ownItem: boolean
	marketplace: string
	item: bigint
}) => {
	const { waku } = useWaku()

	// Wagmi
	const { connector } = useAccount()
	const { chain } = useNetwork()

	// Marketplace
	const name = useMarketplaceName(marketplace)

	// Profile
	const { profile } = useProfile(reply.from)
	const { picture } = useProfilePicture(
		profile?.pictureHash ? bufferToHex(profile.pictureHash) : ''
	)

	// State
	const [loading, setLoading] = useState(false)
	const [selected, setSelected] = useState(false)

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

	return (
		<li>
			<p>From: {formatFrom(reply.from, profile?.username)}</p>
			<ProfilePicture picture={picture} />
			<p>{reply.text}</p>
			{ownItem &&
				(selected ? (
					<p>Provider selected!</p>
				) : (
					<button disabled={loading} onClick={selectProvider}>
						Choose as provider
					</button>
				))}
		</li>
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

const FundDeal = ({
	data,
	marketplace,
	item,
}: {
	data?: SelectProvider
	marketplace: string
	item: bigint
}) => {
	const { v, r, s } = splitSignature(data?.signature ?? [])
	const contract = useMarketplaceContract(marketplace)
	const token = useMarketplaceTokenContract(marketplace)
	const { connector } = useAccount()

	// State
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<Error>()
	const [success, setSuccess] = useState(false)

	// NOTE: Custom `useEffect` instead of useContractWrite because prepared writes
	// cause the password modal to pop up immediately, and reckless writes show the
	// modal again after the password was successfully inserted for some reason.
	const fund = async () => {
		if (!token) {
			setError(new Error('still loading...'))
			return
		}

		setLoading(true)
		setSuccess(false)

		let tx

		try {
			const signer = await connector?.getSigner()
			const mp = await contract.connect(signer)

			// Get the price
			const { price, fee } = await mp.items(item)

			// Convert the price to bigint
			const amountToApprove = price.add(fee.div(2))

			// Approve the tokens to be spent by the marketplace
			tx = await token.connect(signer).approve(marketplace, amountToApprove)
			await tx.wait()

			// Fund the item
			tx = await mp.fundItem(item, v, r, s)
			await tx.wait()

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
			<button onClick={fund} disabled={loading || success}>
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
	const { waku } = useWakuContext()
	const { decimals } = useMarketplaceTokenDecimals(id)
	const contract = useMarketplaceContract(id)
	const { connector } = useAccount()
	const navigate = useNavigate()
	const { replies } = useItemReplies(waku, id, itemId)
	const selectedProvider = useSelectProvider(id, itemId)
	const provider = useMemo(() => {
		const address = selectedProvider.data?.provider
		return address && getAddress(hexlify(address))
	}, [selectedProvider.lastUpdate])

	const chainItem = useMarketplaceItem(id, itemId)

	// TODO: Replace this with a function that only fetches the appropriate item
	const { loading, waiting, items, lastUpdate } = useMarketplaceItems(waku, id)
	const item = useMemo(() => {
		return items.find(({ id }) => id.eq(itemId))
	}, [lastUpdate])

	if (!item || !chainItem.item) {
		if (loading || waiting || chainItem.loading) {
			return <p>Loading...</p>
		}

		return <p>Item not found...</p>
	}

	const cancelItem = async () => {
		if (!connector) {
			throw new Error('no connector')
		}

		const signer = await connector.getSigner()
		const tx = await contract.connect(signer).cancelItem(itemId)
		await tx.wait()
		navigate(`/marketplace/${id}`)
	}

	const status = chainItem.item.status

	return (
		<div>
			<h3>{item.metadata.description}</h3>
			<span>{new Date(item.timestamp * 1000).toISOString()}</span>
			<p>
				{item.owner} - {item.seekerRep.toString()} SWMR
			</p>
			<span>
				{decimals === undefined
					? 'Loading...'
					: `${formatUnits(item.price, decimals)} DAI`}
			</span>

			<p>
				Status: {Statuses[status]} ({formatFrom(chainItem.item.providerAddress)}
				)
			</p>

			{selectedProvider.data && (
				<SelectedProvider {...selectedProvider} data={selectedProvider.data} />
			)}

			{provider === address && status === 1 && (
				<FundDeal marketplace={id} item={itemId} data={selectedProvider.data} />
			)}

			<div>
				Replies:
				{replies.length ? (
					<ul>
						{replies.map((reply) => (
							<Reply
								key={reply.signature}
								reply={reply}
								ownItem={item.owner === address}
								marketplace={id}
								item={itemId}
							/>
						))}
					</ul>
				) : (
					'No replies...'
				)}
			</div>

			{status === 1 &&
				(item.owner === address ? (
					<button onClick={cancelItem} disabled={!contract || !connector}>
						Cancel item
					</button>
				) : (
					<ReplyForm item={item} marketplace={id} decimals={decimals} />
				))}
		</div>
	)
}
