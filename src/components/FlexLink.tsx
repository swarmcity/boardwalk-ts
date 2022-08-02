import { Link } from '@reach/router'

// Types
import type { LinkProps } from '@reach/router'
import type { HTMLAttributes } from '../types/dom'

export interface FlexLinkProps<TState>
	extends Omit<LinkProps<TState>, 'ref' | 'to' | 'onClick'>,
		Pick<HTMLAttributes<HTMLAnchorElement>, 'href' | 'ref' | 'onClick'> {
	to?: LinkProps<TState>['to']
}

export function FlexLink<TState>({
	href,
	to,
	...other
}: FlexLinkProps<TState>) {
	if (to && href) {
		console.warn('do not specify both `to` and `href`')
		return null
	}

	if (to) {
		return <Link to={to} {...(other as object)} />
	}

	return <a href={href} {...(other as object)} />
}
