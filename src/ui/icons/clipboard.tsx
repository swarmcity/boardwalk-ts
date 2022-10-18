import type { Icon } from '../types'

type Props = Icon & React.SVGProps<SVGSVGElement>

export function Clipboard({ size, fill, ...props }: Props) {
	return (
		<svg
			width={size ?? 24}
			height={size ?? 24}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<path
				fill={fill}
				d="M7 4V2h10v2h3.007c.548 0 .993.445.993.993v16.014a.994.994 0 0 1-.993.993H3.993A.994.994 0 0 1 3 21.007V4.993C3 4.445 3.445 4 3.993 4H7zm0 2H5v14h14V6h-2v2H7V6zm2-2v2h6V4H9z"
			/>
		</svg>
	)
}
