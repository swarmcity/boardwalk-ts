import { formatUnits } from '@ethersproject/units'
import { BigNumber } from 'ethers'
import { FormEvent, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { useAccount } from 'wagmi'

// Hooks
import { useWakuContext } from '../../hooks/use-waku'

// Lib
import { bufferToHex, displayAddress } from '../../lib/tools'

// Services
import {
	useMarketplaceContract,
	useMarketplaceTokenDecimals,
} from './services/marketplace'
import {
	createReply,
	ItemReplyClean,
	useItemReplies,
} from './services/marketplace-item'
import { Item, useMarketplaceItems } from './services/marketplace-items'
import { useProfile } from '../../services/profile'
import { useProfilePicture } from '../../services/profile-picture'

// Assets
import avatarDefault from '../../assets/imgs/avatar.svg?url'

// Protos
import { ProfilePicture as ProfilePictureProto } from '../../protos/ProfilePicture'

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

const Reply = ({ reply }: { reply: ItemReplyClean }) => {
	const data = useProfile(reply.from)
	const { profile } = data
	const { picture } = useProfilePicture(
		profile?.pictureHash ? bufferToHex(profile.pictureHash) : ''
	)

	return (
		<li>
			<p>From: {formatFrom(reply.from, profile?.username)}</p>
			<ProfilePicture picture={picture} />
			<p>{reply.text}</p>
		</li>
	)
}

export const MarketplaceItem = () => {
	const { id, item: itemIdString } = useParams<{ id: string; item: string }>()
	if (!id || !itemIdString) {
		throw new Error('no id or item')
	}

	const itemId = BigNumber.from(itemIdString)

	const { address } = useAccount()
	const { waku } = useWakuContext()
	const { decimals } = useMarketplaceTokenDecimals(id)
	const contract = useMarketplaceContract(id)
	const { connector } = useAccount()
	const navigate = useNavigate()
	const { replies } = useItemReplies(waku, id, itemId.toBigInt())

	// TODO: Replace this with a function that only fetches the appropriate item
	const { loading, waiting, items, lastUpdate } = useMarketplaceItems(waku, id)
	const item = useMemo(() => {
		return items.find(({ id }) => id.eq(itemId))
	}, [lastUpdate])

	if (!item) {
		if (loading || waiting) {
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

			<div>
				Replies:
				{replies.length ? (
					<ul>
						{replies.map((reply) => (
							<Reply key={reply.signature} reply={reply} />
						))}
					</ul>
				) : (
					'No replies...'
				)}
			</div>

			{item.owner === address ? (
				<button onClick={cancelItem} disabled={!contract || !connector}>
					Cancel item
				</button>
			) : (
				<ReplyForm item={item} marketplace={id} decimals={decimals} />
			)}
		</div>
	)
}
