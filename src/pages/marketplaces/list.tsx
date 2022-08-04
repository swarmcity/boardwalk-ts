import { useNavigate } from 'react-router-dom'
import { useProvider } from 'wagmi'

// Routes and config
import { MARKETPLACE } from '../../routes'
import { HASHTAG_FACTORY } from '../../config'
import { useEffect, useMemo } from 'react'
import { Contract } from 'ethers'

const hashtags = [
	{ id: '1', name: 'Settler', deals: 40 },
	{ id: '2', name: 'ScCommShare', deals: 50 },
	{ id: '3', name: 'ScSwag', deals: 20 },
]

const EVENT_ABI = {
	anonymous: false,
	inputs: [
		{
			indexed: true,
			internalType: 'address',
			name: 'addr',
			type: 'address',
		},
		{
			indexed: true,
			internalType: 'string',
			name: 'name',
			type: 'string',
		},
		{
			indexed: true,
			internalType: 'string',
			name: 'metadata',
			type: 'string',
		},
	],
	name: 'HashtagCreated',
	type: 'event',
}

export const MarketplaceList = () => {
	const navigate = useNavigate()
	const provider = useProvider()
	const contract = useMemo(
		() => new Contract(HASHTAG_FACTORY, [EVENT_ABI], provider),
		[provider]
	)

	useEffect(() => {
		const filter = contract.filters.HashtagCreated()

		;(async () => {
			const events = await contract.queryFilter(filter, 0)
			console.log(events.map(({ args }) => args))
		})()
	}, [contract])

	return (
		<div>
			{hashtags.map(({ id, name, deals }) => (
				<div key={id} onClick={() => navigate(MARKETPLACE(id))}>
					<h2>{name}</h2>
					<p>{deals} deals completed</p>
				</div>
			))}
		</div>
	)
}
