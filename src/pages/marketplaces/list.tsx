import { useNavigate } from 'react-router-dom'
import { useContractEvent } from 'wagmi'

// Routes and config
import { MARKETPLACE } from '../../routes'
import { HASHTAG_FACTORY } from '../../config'

const hashtags = [
	{ id: '1', name: 'Settler', deals: 40 },
	{ id: '2', name: 'ScCommShare', deals: 50 },
	{ id: '3', name: 'ScSwag', deals: 20 },
]

export const MarketplaceList = () => {
	const navigate = useNavigate()
	useContractEvent({
		addressOrName: HASHTAG_FACTORY,
		contractInterface: [
			{
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
			},
		],
		eventName: 'HashtagCreated',
		listener: (event) => console.log(event),
	})

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
