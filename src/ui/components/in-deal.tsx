import { IconButton } from '@swarm-city/ui-library'
import { HTMLAttributes } from 'react'
import { getColor } from '../colors'
import { Typography } from '../typography'

type Props = HTMLAttributes<HTMLDivElement>

export function InDeal({ children, style, ...props }: Props) {
	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				textAlign: 'center',
				backgroundColor: getColor('green'),
				padding: 30,
				...style,
			}}
			{...props}
		>
			<div style={{ position: 'relative', width: '100%' }}>
				<div
					style={{
						position: 'absolute',
						bottom: 0,
						right: 46,
					}}
				>
					<IconButton variant="chat" />
				</div>
			</div>
			<Typography variant="body-bold-16" color="white">
				You're in a deal!
			</Typography>
			{children}
		</div>
	)
}
