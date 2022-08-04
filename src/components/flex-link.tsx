import { Link } from 'react-router-dom'

// Types
import type { LinkProps } from 'react-router-dom'
import type { AnchorHTMLAttributes } from 'react'

export interface FlexLinkProps
	extends Omit<LinkProps, 'ref' | 'to' | 'onClick'>,
		Pick<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'onClick'> {
	to?: LinkProps['to']
}

export function FlexLink({ href, to, ...other }: FlexLinkProps) {
	if (to && href) {
		console.warn('do not specify both `to` and `href`')
		return null
	}

	if (to) {
		return <Link to={to} {...(other as object)} />
	}

	return <a href={href} {...(other as object)} />
}
