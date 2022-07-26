// Assets
import cancel from '../assets/imgs/cancel.svg?url'
import close from '../assets/imgs/close.svg?url'
import closeWhite from '../assets/imgs/closeWhite.svg?url'

// Components
import { FlexLink, FlexLinkProps } from './FlexLink'

const VARIANTS = {
	light: closeWhite,
	default: cancel,
	dark: close,
}

export interface ButtonCloseProps<TState> extends FlexLinkProps<TState> {
	variant?: keyof typeof VARIANTS
}

export function ButtonClose<TState>({
	variant,
	...other
}: ButtonCloseProps<TState>) {
	return (
		<FlexLink role="button" {...other}>
			<img src={VARIANTS[variant || 'default']} />
		</FlexLink>
	)
}
