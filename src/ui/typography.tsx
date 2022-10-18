import { HTMLAttributes } from 'react'
import { Colors, getColor } from './colors'

interface Props extends HTMLAttributes<HTMLSpanElement> {
	variant?:
		| 'header-56'
		| 'header-44'
		| 'header-35'
		| 'header-30'
		| 'header-28'
		| 'header-26'
		| 'header-24'
		| 'header-22'
		| 'body-extra-light-20'
		| 'body-extra-light-18'
		| 'body-bold-16'
		| 'body-light-16'
		| 'small-bold-12'
		| 'small-light-12'
		| 'small-bold-10'
		| 'small-light-10'
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
		lineHeight: 1.2,
		margin: 0,
		padding: 0,
		color,
		textAlign,
		...style,
	}
	const bodyStyles = {
		fontFamily: 'Montserrat',
		fontStyle: 'normal',
		lineHeight: 1.2,
		margin: 0,
		padding: 0,
		color,
		textAlign,
		...style,
	}
	switch (variant) {
		case 'header-56':
			return (
				<h1
					style={{
						fontSize: 56,
						...headerStyles,
					}}
					{...props}
				>
					{children}
				</h1>
			)
		case 'header-44':
			return (
				<h2
					style={{
						fontSize: 44,
						...headerStyles,
					}}
					{...props}
				>
					{children}
				</h2>
			)
		case 'header-35':
			return (
				<h3
					style={{
						fontSize: 35,
						...headerStyles,
					}}
					{...props}
				>
					{children}
				</h3>
			)
		case 'header-30':
			return (
				<h4
					style={{
						fontSize: 30,
						...headerStyles,
					}}
					{...props}
				>
					{children}
				</h4>
			)
		case 'header-28':
			return (
				<h5
					style={{
						fontSize: 28,
						...headerStyles,
					}}
					{...props}
				>
					{children}
				</h5>
			)
		case 'header-26':
			return (
				<h6
					style={{
						fontSize: 26,
						...headerStyles,
					}}
					{...props}
				>
					{children}
				</h6>
			)
		case 'header-24':
			return (
				<span
					style={{
						fontSize: 24,
						...headerStyles,
					}}
					{...props}
				>
					{children}
				</span>
			)
		case 'header-22':
			return (
				<span
					style={{
						fontSize: 22,
						...headerStyles,
					}}
					{...props}
				>
					{children}
				</span>
			)
		case 'body-extra-light-20':
			return (
				<span
					style={{
						fontFamily: 'Montserrat',
						fontStyle: 'normal',
						fontWeight: 200,
						fontSize: 20,
						color,
						textAlign,
						...style,
					}}
					{...props}
				>
					{children}
				</span>
			)
		case 'body-extra-light-18':
			return (
				<span
					style={{
						fontWeight: 200,
						fontSize: 18,
						...bodyStyles,
					}}
					{...props}
				>
					{children}
				</span>
			)
		case 'body-bold-16':
			return (
				<span
					style={{
						fontWeight: 700,
						fontSize: 16,
						...bodyStyles,
					}}
					{...props}
				>
					{children}
				</span>
			)

		case 'body-light-16':
			return (
				<span
					style={{
						fontWeight: 300,
						fontSize: 16,
						...bodyStyles,
					}}
					{...props}
				>
					{children}
				</span>
			)
		case 'small-bold-12':
			return (
				<span
					style={{
						fontWeight: 700,
						fontSize: 12,
						...bodyStyles,
					}}
					{...props}
				>
					{children}
				</span>
			)
		case 'small-light-12':
			return (
				<span
					style={{
						fontWeight: 300,
						fontSize: 12,
						...bodyStyles,
					}}
					{...props}
				>
					{children}
				</span>
			)
		case 'small-light-10':
			return (
				<span
					style={{
						fontWeight: 300,
						fontSize: 10,
						...bodyStyles,
					}}
					{...props}
				>
					{children}
				</span>
			)

		case 'small-bold-10':
			return (
				<span
					style={{
						fontWeight: 700,
						fontSize: 10,
						...bodyStyles,
					}}
					{...props}
				>
					{children}
				</span>
			)
		default:
			return (
				<span
					style={{
						...bodyStyles,
					}}
					{...props}
				>
					{children}
				</span>
			)
	}
}
