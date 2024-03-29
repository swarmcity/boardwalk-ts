import type { Icon } from '../types'

type Props = Icon & React.SVGProps<SVGSVGElement>

export function Back({ size, fill, ...props }: Props) {
	return (
		<svg
			width={size ?? 25}
			height={size ?? 25}
			viewBox="0 0 25 25"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M11 0.4047L0 11.4047L11 22.4047C11.2 22.6047 11.5 22.8047 11.9 22.8047C12.2 22.8047 12.5 22.7047 12.8 22.4047C13 22.2047 13.2 21.9047 13.2 21.5047C13.2 21.2047 13.1 20.9047 12.8 20.6047L4.9 12.7047H23.3C23.6 12.7047 23.9 12.6047 24.2 12.3047C24.4 12.1047 24.6 11.8047 24.6 11.4047C24.6 11.1047 24.5 10.8047 24.2 10.5047C24 10.3047 23.7 10.1047 23.3 10.1047H4.7L12.8 2.0047C13 1.8047 13.2 1.5047 13.2 1.1047C13.2 0.8047 13.1 0.5047 12.8 0.2047C12.3 -0.0953 11.5 -0.0953 11 0.4047"
				fill={fill ?? '#666666'}
			/>
		</svg>
	)
}
