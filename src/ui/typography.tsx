import { HTMLAttributes } from 'react'
import { Colors, getColor } from './colors'

interface Props extends HTMLAttributes<HTMLSpanElement> {
	variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'h7' | 'h8'
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

	const headerStyles = {
		fontFamily: 'Montserrat',
		fontStyle: 'normal',
		fontWeight: 700,
		color,
		textAlign,
		...style,
	}
	switch (variant) {
		case 'h1':
			return (
				<h1
					style={{
						fontSize: 56,
						...headerStyles,
					}}
				>
					{children}
				</h1>
			)
		case 'h2':
			return (
				<h2
					style={{
						fontSize: 44,
						...headerStyles,
					}}
				>
					{children}
				</h2>
			)
		case 'h3':
			return (
				<h3
					style={{
						fontSize: 35,
						...headerStyles,
					}}
				>
					{children}
				</h3>
			)
		case 'h4':
			return (
				<h4
					style={{
						fontSize: 30,
						...headerStyles,
					}}
				>
					{children}
				</h4>
			)
		case 'h5':
			return (
				<h5
					style={{
						fontSize: 28,
						...headerStyles,
					}}
				>
					{children}
				</h5>
			)
		case 'h6':
			return (
				<h6
					style={{
						fontSize: 26,
						...headerStyles,
					}}
				>
					{children}
				</h6>
			)
		case 'h7':
			return (
				<span
					style={{
						fontSize: 24,
						...headerStyles,
					}}
				>
					{children}
				</span>
			)
		case 'h8':
			return (
				<span
					style={{
						fontSize: 22,
						...headerStyles,
					}}
				>
					{children}
				</span>
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
