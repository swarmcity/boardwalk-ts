import { HTMLAttributes } from 'react'
import avatarDefault from '../assets/imgs/avatar.svg?url'

interface Props extends HTMLAttributes<HTMLImageElement> {
	avatar?: string
	size?: number
}

export function Avatar({ avatar, style, size, ...props }: Props) {
	return (
		<img
			style={{
				objectFit: 'cover',
				width: size ?? 75,
				height: size ?? 75,
				borderRadius: '50%',
				overflow: 'hidden',
				...style,
			}}
			src={avatar ?? avatarDefault}
			{...props}
		/>
	)
}
