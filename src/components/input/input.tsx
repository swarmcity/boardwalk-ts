import { JSXInternal } from 'preact/src/jsx'

// Style
import classes from './input.module.css'

export type InputProps = JSXInternal.HTMLAttributes<HTMLInputElement> & {
	id: string
}

export const Input = ({ id, children, ...props }: InputProps) => (
	<div class={classes.inputGroup}>
		<input id={id} required {...props} />
		<label for={id}>{children}</label>
	</div>
)
