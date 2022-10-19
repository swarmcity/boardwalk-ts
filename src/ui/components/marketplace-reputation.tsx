import { HTMLAttributes } from 'react'
import { Typography } from '../typography'

interface Props extends HTMLAttributes<HTMLDivElement> {
	marketplaceName: string
	seekerRep: number
	providerRep: number
}

export function MarketplaceReputation({
	marketplaceName,
	seekerRep,
	providerRep,
	style,
	...props
}: Props) {
	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				textAlign: 'left',
				alignItems: 'flex-start',
				...style,
			}}
			{...props}
		>
			<Typography variant="body-bold-16" color="grey4">
				{marketplaceName}
			</Typography>
			<div
				style={{
					display: 'flex',
					flexDirection: 'row',
					alignItems: 'center',
				}}
			>
				<div style={{ display: 'flex', flexDirection: 'column' }}>
					<Typography variant="body-extra-light-20" color="blue">
						{seekerRep.toFixed(0)} SWR
					</Typography>
					<Typography variant="small-light-12" color="grey3">
						as a Seeker
					</Typography>
				</div>
				<div
					style={{
						height: 32,
						width: 0,
						border: '1px dashed #BFBFBF',
						marginLeft: 15,
						marginRight: 15,
					}}
				/>
				<div style={{ display: 'flex', flexDirection: 'column' }}>
					<Typography variant="body-extra-light-20" color="blue">
						{providerRep.toFixed(0)} SWR
					</Typography>
					<Typography variant="small-light-12" color="grey3">
						as a Provider
					</Typography>
				</div>
			</div>
		</div>
	)
}
