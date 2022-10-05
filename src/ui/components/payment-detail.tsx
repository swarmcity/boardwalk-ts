import { HTMLAttributes } from 'react'

import { Avatar } from '../avatar'
import { User } from '../types'
import { Typography } from '../typography'
import { formatName } from '../utils'

interface Props extends HTMLAttributes<HTMLDivElement> {
	seeker: User
	provider: User
	user: User
	amount: number
	reputation: number
	marketplace: string
}

export function PaymentDetail({
	seeker,
	provider,
	user,
	amount,
	reputation,
	marketplace,
}: Props) {
	const isSeeker = seeker.address === user.address
	const isProvider = provider.address === user.address

	return (
		<div>
			<div
				style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}
			>
				<Avatar size={25} avatar={seeker.avatar} />
				<div style={{ display: 'flex', flexDirection: 'column' }}>
					<Typography variant="small-light-12">
						{isSeeker ? 'You' : formatName(seeker)} paid {amount} DAI to{' '}
						{isProvider ? 'you' : formatName(provider)}.
					</Typography>
					<Typography variant="small-light-12">
						{isSeeker ? 'You' : formatName(seeker)} gained {reputation} SWR on{' '}
						{marketplace}.
					</Typography>
				</div>
			</div>
			<div
				style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}
			>
				<Avatar size={25} avatar={provider.avatar} />
				<div style={{ display: 'flex', flexDirection: 'column' }}>
					<Typography variant="small-light-12">
						{isProvider ? 'You' : formatName(provider)} received {amount} DAI from{' '}
						{isSeeker ? 'you' : formatName(seeker)}.
					</Typography>
					<Typography variant="small-light-12">
						{isProvider ? 'You' : formatName(provider)} gained {reputation} SWR on{' '}
						{marketplace}.
					</Typography>
				</div>
			</div>
		</div>
	)
}
