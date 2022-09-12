import { HTMLAttributes } from 'react'
import avatarDefault from '../assets/imgs/avatar.svg?url'

interface Props extends HTMLAttributes<HTMLDivElement> {
	avatar: string
}

export function Avatar({ avatar, style }: Props) {
	return (
		<div
			style={{
				width: 75,
				height: 75,
				borderRadius: '50%',
				overflow: 'hidden',
				...style,
			}}
		>
			<img
				style={{ maxWidth: '100%', maxHeight: '100%' }}
				src={avatar ?? avatarDefault}
			/>
		</div>
	)
}
