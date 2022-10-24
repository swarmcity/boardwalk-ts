import { HTMLAttributes, ReactNode } from 'react'
import { getColor } from '../colors'
import { Typography } from '../typography'

type Props = HTMLAttributes<HTMLDivElement> & {
	chat: ReactNode
}

export function InDeal({ children, style, chat, ...props }: Props) {
	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				textAlign: 'center',
				backgroundColor: getColor('green'),
				padding: 40,
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
			<Typography variant="body-bold-16" color="white">
				You're in a deal!
			</Typography>
			{children}
		</div>
	)
}
