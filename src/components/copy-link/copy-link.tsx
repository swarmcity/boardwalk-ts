import { HTMLAttributes, useState } from 'react'

// Types
import { Typography } from '../../ui/typography'
import { getColor } from '../../ui/colors'

interface CopyLinkProps extends HTMLAttributes<HTMLDivElement> {
	text: string
}

export const CopyLink = ({ text, children, ...props }: CopyLinkProps) => {
	const [showCopied, setShowCopied] = useState(false)
	const copy = () => {
		navigator.clipboard.writeText(text)
		setShowCopied(true)
		setTimeout(() => setShowCopied(false), 2000)
	}

	return (
		<div {...props}>
			<div style={{ position: 'relative', width: '100%' }}>
				{showCopied && (
					<div
						style={{
							// FIXME: make this as an actual tooltip
							position: 'absolute',
							right: 15,
							top: 30,
							backgroundColor: getColor('grey5'),
							padding: 10,
							borderRadius: 6,
						}}
					>
						<Typography variant="small-bold-12" color="white">
							Copied!
						</Typography>
					</div>
				)}
			</div>

			<Typography
				style={{
					cursor: 'pointer',
					borderBottom: `2px dotted ${getColor('blue')}`,
				}}
				variant="small-bold-12"
				color="blue"
				onClick={copy}
			>
				{children}
			</Typography>
		</div>
	)
}
