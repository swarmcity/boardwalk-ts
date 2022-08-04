// Types
import type { InputHTMLAttributes } from 'react'

// Style
import classes from './input.module.css'

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
	id: string
}

export const Input = ({ id, children, ...props }: InputProps) => (
	<div className={classes.inputGroup}>
		<input id={id} required {...props} />
		<label htmlFor={id}>{children}</label>
	</div>
)
