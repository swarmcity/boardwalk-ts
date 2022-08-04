import { useState } from 'react'

// Style
import classes from './copy-link.module.css'

// Types
import type { AnchorHTMLAttributes } from 'react'

interface CopyLinkProps
	extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'style'> {
	text: string
}

export const CopyLink = ({ text, ...other }: CopyLinkProps) => {
	const [showCopied, setShowCopied] = useState(false)
	const copy = () => {
		navigator.clipboard.writeText(text)
		setShowCopied(true)
		setTimeout(() => setShowCopied(false), 2000)
	}

	return (
		<>
			<div className={classes.copiedWrapper}>
				{showCopied && <div className={classes.copied}>Copied!</div>}
			</div>

			<a style={{ cursor: 'pointer' }} {...other} onClick={copy} />
		</>
	)
}
