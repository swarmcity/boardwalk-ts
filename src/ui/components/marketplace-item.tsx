import classes from './marketplace-item.module.css'
import { HTMLAttributes } from 'react'
import { IconButton } from '@swarm-city/ui-library'
import { Typography } from '../typography'

export interface MarketplaceItemProps extends HTMLAttributes<HTMLDivElement> {
	title: string
	completedDeals: number
}
export const MarketplaceItem = ({
	className,
	title,
	completedDeals,
	...props
}: MarketplaceItemProps) => (
	<div className={[classes.root, className].join(' ')} {...props}>
		<div className={classes.wrapper}>
			<div className={classes.wrapperTitle}>
				<Typography variant="header-28" color="grey4">
					{title}
				</Typography>
				<IconButton variant="select" />
			</div>
			<Typography variant="small-light-12" color="grey3">
				{completedDeals.toFixed()} deals completed
			</Typography>
		</div>
	</div>
)
