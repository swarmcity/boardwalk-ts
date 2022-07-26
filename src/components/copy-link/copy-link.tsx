import { useState } from 'preact/hooks'

// Style
import classes from './copy-link.module.css'

// Types
import type { JSXInternal } from 'preact/src/jsx'

interface CopyLinkProps extends JSXInternal.HTMLAttributes<HTMLAnchorElement> {
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
			<div class={classes.copiedWrapper}>
				{showCopied && <div class={classes.copied}>Copied!</div>}
			</div>

			<a style={{ cursor: 'pointer' }} {...other} onClick={copy} />
		</>
	)
}
