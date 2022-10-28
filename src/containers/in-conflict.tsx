import { HTMLAttributes, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

import { getColor } from '../ui/colors'
import { Typography } from '../ui/typography'
import { Avatar } from '../ui/avatar'
import { formatName } from '../ui/utils'

import type { User } from '../ui/types'
import { USER } from '../routes'
import { ResolveConflict } from './resolve-conflict'

type Props = HTMLAttributes<HTMLDivElement> & {
	chat: ReactNode
	user?: User
	provider: User
	seeker: User
	marketplaceOwner: User
	amount: bigint
	tokenName: string
}

export function InConflict({
	style,
	chat,
	user,
	provider,
	seeker,
	marketplaceOwner,
	amount,
	tokenName,
	...props
}: Props) {
	const navigate = useNavigate()
	const isMarketplaceOwner =
		user?.address && user.address === marketplaceOwner.address

	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				textAlign: 'center',
				padding: 20,
				borderTop: `2px solid ${getColor('grey2')}`,
				borderBottom: `4px solid ${getColor('red')}`,
				...style,
			}}
			{...props}
		>
			<div style={{ position: 'relative', width: '100%' }}>
				<div
					style={{
						position: 'absolute',
						bottom: 0,
						right: 0,
					}}
				>
					{chat}
				</div>
			</div>
			<Typography variant="body-bold-16" color="grey4">
				{user &&
				(user.address === seeker.address || user.address === provider.address)
					? 'You are'
					: 'They are'}{' '}
				<span style={{ color: getColor('red-text') }}>in conflict</span>.
			</Typography>
			<Typography
				variant="small-light-12"
				color="grey4"
				style={{ marginTop: 5 }}
			>
				{user && user.address === marketplaceOwner.address
					? 'You were added to the chat.'
					: 'The marketplace maintainer was added to the chat.'}
			</Typography>
			{isMarketplaceOwner && (
				<div
					style={{
						marginTop: 30,
					}}
				>
					<ResolveConflict
						seeker={seeker}
						provider={provider}
						amount={amount}
						tokenName={tokenName}
					/>
				</div>
			)}
			{(!user || !isMarketplaceOwner) && (
				<div
					style={{
						marginTop: 30,
						display: 'flex',
						flexDirection: 'row',
						alignItems: 'center',
						cursor: 'pointer',
						width: 'fit-content',
					}}
					onClick={() => navigate(USER(marketplaceOwner.address))}
				>
					<Avatar avatar={marketplaceOwner.avatar} size={40} />
					<Typography
						variant="small-bold-12"
						color="blue"
						style={{ marginLeft: 15 }}
					>
						{formatName(marketplaceOwner)}
					</Typography>
				</div>
			)}
		</div>
	)
}
