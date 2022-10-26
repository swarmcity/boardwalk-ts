import { IconButton } from '@swarm-city/ui-library'
import { HTMLAttributes } from 'react'

import { getColor } from '../colors'
import { Typography } from '../typography'

interface Props extends HTMLAttributes<HTMLDivElement> {
	onClose?: () => void
}

export function ErrorModal({ onClose }: Props) {
	return (
		<div
			style={{
				position: 'fixed',
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'center',
				alignItems: 'center',
				padding: 30,
				overflow: 'hidden',
				top: 0,
				left: 0,
				bottom: 0,
				right: 0,
				backgroundColor: getColor('red'),
				zIndex: 100,
			}}
		>
			<Typography color="white" variant="header-35">
				Something went wrong...
			</Typography>
			<div style={{ marginTop: 30 }}>
				<IconButton variant="errorNext" onClick={onClose} />
			</div>
		</div>
	)
}
