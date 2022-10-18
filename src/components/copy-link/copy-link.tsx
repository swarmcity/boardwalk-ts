import { HTMLAttributes, useState } from 'react'

// Types
import { Typography } from '../../ui/typography'
import { getColor } from '../../ui/colors'
import { Clipboard } from '../../ui/icons/clipboard'

interface CopyLinkProps extends HTMLAttributes<HTMLDivElement> {
	text: string
}

export const CopyLink = ({ text, ...props }: CopyLinkProps) => {
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
							left: -25,
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

			<Clipboard
				style={{ cursor: 'pointer' }}
				fill={getColor('blue')}
				onClick={copy}
			/>
		</div>
	)
}
