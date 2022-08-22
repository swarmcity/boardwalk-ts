import { formatUnits } from '@ethersproject/units'
import { BigNumber } from 'ethers'
import { FormEvent, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { useAccount } from 'wagmi'

// Hooks
import { useWaku } from '../../hooks/use-waku'

// Services
import {
	useMarketplaceContract,
	useMarketplaceTokenDecimals,
} from './services/marketplace'
import { createReply } from './services/marketplace-item'
import { Item, useMarketplaceItems } from './services/marketplace-items'

type ReplyFormProps = {
	item: Item
	marketplace: string
	decimals: number | undefined
}

const ReplyForm = ({ item, marketplace, decimals }: ReplyFormProps) => {
	const [text, setText] = useState('')

	const { waku } = useWaku()
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

export const MarketplaceItem = () => {
	const { id, item: itemIdString } = useParams<{ id: string; item: string }>()
	if (!id || !itemIdString) {
		throw new Error('no id or item')
	}

	const itemId = BigNumber.from(itemIdString)

	const { address } = useAccount()
	const { waku } = useWaku()
	const { decimals } = useMarketplaceTokenDecimals(id)
	const contract = useMarketplaceContract(id)
	const { connector } = useAccount()
	const navigate = useNavigate()

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
