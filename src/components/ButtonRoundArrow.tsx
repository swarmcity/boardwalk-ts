import cn from 'classnames'

// Assets
import caretNext from '../assets/imgs/caretNext.svg?url'
import caretNextGreen from '../assets/imgs/caretNextGreen.svg?url'
import caretNextNegative from '../assets/imgs/caretNextNegative.svg?url'
import checkMarkBlue from '../assets/imgs/checkMarkBlue.svg?url'
import checkMarkRed from '../assets/imgs/checkMarkRed.svg?url'

// Components
import { FlexLink, FlexLinkProps } from './FlexLink'

const DIRECTIONS = {
	right: 0,
	down: 90,
	left: 180,
	up: 270,
}

const VARIANTS = {
	default: caretNext,
	negative: caretNextNegative,
	check: checkMarkBlue,
	checkRed: checkMarkRed,
	green: caretNextGreen,
}

export interface ButtonRoundArrowProps<TState> extends FlexLinkProps<TState> {
	disabled?: boolean
	direction?: keyof typeof DIRECTIONS
	variant?: keyof typeof VARIANTS
}

export function ButtonRoundArrow<TState>({
	disabled,
	direction,
	variant,
	...other
}: ButtonRoundArrowProps<TState>) {
	const classes = cn('btn-icon', variant === 'negative' && 'btn-neg')
	const rotation = DIRECTIONS[direction || 'right']
	const img = (
		<img
			src={VARIANTS[variant || 'default']}
			style={{ transform: `rotate(${rotation}deg)` }}
		/>
	)

	if (disabled)
		return (
			<span class={classes} style={{ cursor: 'not-allowed', opacity: 0.5 }}>
				{img}
			</span>
		)

	return (
		<FlexLink role="button" className={classes} {...other}>
			{img}
		</FlexLink>
	)
}
