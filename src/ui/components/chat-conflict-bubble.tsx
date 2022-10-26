import { HTMLAttributes } from 'react'
import { Avatar } from '../avatar'
import { Typography } from '../typography'
import { formatDate, formatName } from '../utils'
import type { User, Message } from '../types'
import { getColor } from '../colors'
import { ChatBubble } from './chat-bubble'

interface Props extends HTMLAttributes<HTMLDivElement> {
	message: Message
	user: User
	marketplaceOwner: User

	customDateText?: string
}

export function ChatConflictBubble({ message, user, marketplaceOwner }: Props) {
	const myMessage = user.address === message.from.address
	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				marginTop: 40,
				marginBottom: 10,
			}}
		>
			<Typography
				variant="small-light-10"
				color="grey2-light-text"
				textAlign="center"
			>
				{formatDate(message.date)}
			</Typography>
			<div
				style={{
					padding: 10,
					marginTop: 5,
					marginBottom: 5,
					backgroundColor: getColor('grey1'),
					textAlign: 'center',
				}}
			>
				<Typography variant="small-bold-12">
					This deal is now{' '}
					<span style={{ color: getColor('red-text') }}>in conflict</span>.
				</Typography>
			</div>
			<ChatBubble
				message={message}
				user={user}
				customDateText={`${formatName(message.from)}'s motivation`}
			/>
			<Typography
				variant="small-light-10"
				color="grey2-light-text"
				textAlign="center"
				style={{ marginTop: 30 }}
			>
				{formatDate(message.date)}
			</Typography>
			<div
				style={{
					padding: 10,
					marginTop: 5,
					marginBottom: 5,
					backgroundColor: getColor('grey1'),
					textAlign: 'center',
				}}
			>
				<Typography variant="small-light-12">
					{myMessage ? 'You were' : 'The marketplace maintainer is'} added.
				</Typography>
			</div>
			<div
				style={{
					display: 'flex',
					flexDirection: 'row',
					justifyContent: 'center',
					marginTop: 5,
					alignItems: 'center',
				}}
			>
				<div style={{ width: 25, height: 25, marginRight: 10 }}>
					<Avatar avatar={marketplaceOwner.avatar} size={25} />
				</div>

				<Typography variant="small-bold-12">
					{formatName(marketplaceOwner)}
				</Typography>
			</div>
		</div>
	)
}
