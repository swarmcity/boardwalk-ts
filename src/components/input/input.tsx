// Types
import type { HTMLAttributes } from '../../types/dom'

// Style
import classes from './input.module.css'

export type InputProps = HTMLAttributes<HTMLInputElement> & {
	id: string
}

export const Input = ({ id, children, ...props }: InputProps) => (
	<div class={classes.inputGroup}>
		<input id={id} required {...props} />
		<label for={id}>{children}</label>
	</div>
)
