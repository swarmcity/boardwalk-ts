import type { Icon } from '../types'

type Props = Icon & React.SVGProps<SVGSVGElement>

export function Plus({ size, fill, ...props }: Props) {
	return (
		<svg
			width={size ?? 12}
			height={size ?? 12}
			viewBox="0 0 12 12"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M11.3793 5.37931H6.62069V0.62069C6.62069 0.258621 6.31034 0 6 0C5.68966 0 5.37931 0.310345 5.37931 0.62069V5.37931H0.62069C0.258621 5.37931 0 5.68966 0 6C0 6.31034 0.310345 6.62069 0.62069 6.62069H5.37931V11.3793C5.37931 11.7414 5.68966 12 6 12C6.31034 12 6.62069 11.6897 6.62069 11.3793V6.62069H11.3793C11.7414 6.62069 12 6.31034 12 6C12 5.68966 11.7414 5.37931 11.3793 5.37931Z"
				fill={fill ?? '#FAFAFA'}
			/>
		</svg>
	)
}
