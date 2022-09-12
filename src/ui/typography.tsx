import { HTMLAttributes } from 'react'
import { Colors, getColor } from './colors'

interface Props extends HTMLAttributes<HTMLSpanElement> {
	variant?: 'h1' | 'h2'
	color?: Colors
	textAlign?: 'center' | 'left' | 'right' | 'justify' | 'initial' | 'inherit'
}

export function Typography({
	children,
	variant,
	style,
	textAlign,
	color: colorName,
	...props
}: Props) {
	const color = getColor(colorName)
	switch (variant) {
		case 'h1':
			return (
				<h2
					style={{
						fontFamily: 'Montserrat',
						fontStyle: 'normal',
						fontWeight: 700,
						fontSize: 35,
						color,
						textAlign,
						...style,
					}}
				>
					{children}
				</h2>
			)
		case 'h2':
			return (
				<h2
					style={{
						fontFamily: 'Montserrat',
						fontStyle: 'normal',
						fontWeight: 700,
						fontSize: 28,
						color,
						textAlign,
						...style,
					}}
				>
					{children}
				</h2>
			)
		default:
			return (
				<span
					style={{
						fontFamily: 'Montserrat',
						fontStyle: 'normal',
						fontWeight: 300,
						fontSize: 12,
						color,
						textAlign,
						...style,
					}}
				>
					{children}
				</span>
			)
	}
}
