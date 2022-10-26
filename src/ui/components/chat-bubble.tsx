import { HTMLAttributes } from 'react'
import { Avatar } from '../avatar'
import { Typography } from '../typography'
import { formatDate } from '../utils'
import type { User, Message } from '../types'

interface Props extends HTMLAttributes<HTMLDivElement> {
	message: Message
	user: User
	customDateText?: string
}

export function ChatBubble({ message, user, customDateText }: Props) {
	const myMessage = user.address === message.from.address
	return (
		<div
			style={{
				display: 'flex',
				flexDirection: myMessage ? 'row' : 'row-reverse',
			}}
		>
			<div style={{ width: 25, height: 25 }}>
				<Avatar avatar={message.from.avatar} size={25} />
			</div>
			<div
				style={{
					display: 'flex',
					flexDirection: 'column',
					marginLeft: 10,
					marginRight: 10,
					textAlign: myMessage ? 'left' : 'right',
				}}
			>
				<Typography variant="small-light-10" color="grey2-light-text">
					{customDateText ?? formatDate(message.date)}
				</Typography>
				<Typography variant="body-light-16" color="grey4">
					{message.text}
				</Typography>
			</div>
		</div>
	)
}
