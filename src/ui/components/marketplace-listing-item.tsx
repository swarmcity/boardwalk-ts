import { UserInfo } from '@swarm-city/ui-library'
import type { HTMLAttributes } from 'react'
import { Avatar } from '../avatar'
import { User } from '../types'
import { Typography } from '../typography'
import { formatDate, formatName } from '../utils'

interface MarketplaceListingItemProps extends HTMLAttributes<HTMLDivElement> {
	title: string
	repliesCount: number
	date: Date
	amount: number
	user: User
	isMyListing?: boolean
	onClickUser: (user: User) => void
	status: 'open' | 'done' | 'cancelled'
}
export const MarketplaceListingItem = ({
	title,
	repliesCount,
	date,
	amount,
	user,
	isMyListing,
	onClickUser,
	status,
}: MarketplaceListingItemProps) => (
	<div>
		<div
			style={{
				display: 'flex',
				alignItems: 'flex-start',
				flexDirection: 'row',
				justifyContent: 'space-between',
			}}
		>
			<Typography
				variant="body-extra-light-18"
				color="grey4"
				style={{ flexBasis: '75%', fontSize: 20, margin: 0 }}
			>
				{title}
			</Typography>
			<Typography variant="small-bold-12" color="grey4">
				{repliesCount}
			</Typography>
		</div>
		<Typography variant="small-light-10" color="grey2-light-text">
			{formatDate(date)}
		</Typography>
		<div
			style={{
				display: 'flex',
				flexDirection: 'row',
				justifyContent: 'space-between',
				alignItems: 'center',
			}}
		>
			<div
				onClick={(e) => {
					if (isMyListing && onClickUser) {
						e.stopPropagation()
						onClickUser(user)
					}
				}}
				style={{
					display: 'flex',
					flexDirection: 'row',
					alignItems: 'center',
					cursor: isMyListing ? 'default' : 'pointer',
				}}
			>
				<Avatar avatar={user.avatar} size={25} />
				{status === 'open' && (
					<Typography
						variant="small-bold-12"
						color={isMyListing ? 'grey4' : 'blue'}
						style={{ marginLeft: 8 }}
					>
						<>
							{formatName(user)} • {user.reputation} SWT
						</>
					</Typography>
				)}
				{status === 'cancelled' && (
					<Typography
						variant="small-bold-12"
						color="grey4"
						style={{ marginLeft: 8 }}
					>
						Deal canceled.
					</Typography>
				)}
				{status === 'done' && (
					<Typography
						variant="small-bold-12"
						color="grey4"
						style={{ marginLeft: 8 }}
					>
						Deal complete.
					</Typography>
				)}
			</div>
			<div
				style={{
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'flex-end',
				}}
			>
				<Typography variant="small-bold-10" color="yellow">
					DAI
				</Typography>
				<Typography variant="header-24" color="yellow">
					{amount}
				</Typography>
			</div>
		</div>
	</div>
)
