import { HTMLAttributes } from 'react'

type Props = HTMLAttributes<HTMLDivElement>

export function Container({ children, style, ...props }: Props) {
	return (
		<div
			style={{
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				flexDirection: 'column',
				textAlign: 'left',
				width: '100%',
				...style,
			}}
			{...props}
		>
			<div style={{ maxWidth: 1000, width: '100%', textAlign: 'left' }}>
				{children}
			</div>
		</div>
	)
}
