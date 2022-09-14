import { HTMLAttributes } from 'react'
import avatarDefault from '../assets/imgs/avatar.svg?url'

interface Props extends HTMLAttributes<HTMLDivElement> {
	avatar?: string
	size?: number
}

export function Avatar({ avatar, style, size }: Props) {
	return (
		<div
			style={{
				width: size ?? 75,
				height: size ?? 75,
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
