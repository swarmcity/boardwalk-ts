import { HTMLAttributes } from 'react'

import { Avatar } from '../avatar'
import { User } from '../types'
import { Typography } from '../typography'
import { amountToString, formatName } from '../utils'

interface Props extends HTMLAttributes<HTMLDivElement> {
	seeker: User
	provider: User
	user?: User
	marketplaceOwner: User
	amountPaidSeeker: number
	amountPaidProvider: number
	tokenName?: string
}

export function ConflictResolutionDetail({
	seeker,
	provider,
	user,
	marketplaceOwner,
	amountPaidSeeker,
	amountPaidProvider,
	tokenName,
	style,
	...props
}: Props) {
	const isSeeker = seeker.address === user?.address
	const isProvider = provider.address === user?.address
	const isMarketplaceOwner = marketplaceOwner.address === user?.address

	return (
		<div style={{ textAlign: 'left', ...style }} {...props}>
			<div
				style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}
			>
				<div style={{ width: 40, height: 40 }}>
					<Avatar size={40} avatar={marketplaceOwner.avatar} />
				</div>
				<div
					style={{ display: 'flex', flexDirection: 'column', marginLeft: 18 }}
				>
					<Typography variant="small-light-12">
						{isMarketplaceOwner ? 'You' : formatName(marketplaceOwner)} resolved
						the conflict by paying out the deal.
					</Typography>
				</div>
			</div>
			<div
				style={{
					display: 'flex',
					flexDirection: 'row',
					alignItems: 'center',
					marginTop: 30,
				}}
			>
				<div style={{ width: 40, height: 40 }}>
					<Avatar size={40} avatar={seeker.avatar} />
				</div>
				<div
					style={{ display: 'flex', flexDirection: 'column', marginLeft: 18 }}
				>
					<Typography variant="small-light-12">
						{isSeeker ? 'You were' : `${formatName(seeker)} was`} paid{' '}
						{amountToString(amountPaidSeeker)} {tokenName}.
					</Typography>
				</div>
			</div>
			<div
				style={{
					display: 'flex',
					flexDirection: 'row',
					alignItems: 'center',
					marginTop: 30,
				}}
			>
				<div style={{ width: 40, height: 40 }}>
					<Avatar size={40} avatar={provider.avatar} />
				</div>
				<div
					style={{ display: 'flex', flexDirection: 'column', marginLeft: 18 }}
				>
					<Typography variant="small-light-12">
						{isProvider ? 'You were' : `${formatName(provider)} was`} paid{' '}
						{amountToString(amountPaidProvider)} {tokenName}.
					</Typography>
				</div>
			</div>
		</div>
	)
}
