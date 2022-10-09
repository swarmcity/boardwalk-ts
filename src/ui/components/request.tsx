import type { HTMLAttributes } from 'react'
import { Avatar } from '../avatar'
import { User } from '../types'
import { Typography } from '../typography'
import { formatDate, formatName } from '../utils'
import iconReplies from '../assets/icon-replies.svg?url'

interface RequestProps extends HTMLAttributes<HTMLDivElement> {
	title: string
	repliesCount: number
	date: Date
	amount: number
	seeker: User
	provider?: User
	isMyListing?: boolean
	detail?: boolean
	onClickUser: (user: User) => void
	status?:
		| 'none'
		| 'open'
		| 'funded'
		| 'complete'
		| 'disputed'
		| 'resolved'
		| 'cancelled'
}
export const Request = ({
	title,
	repliesCount,
	date,
	amount,
	seeker,
	provider,
	isMyListing,
	onClickUser,
	detail,
	status,
}: RequestProps) => (
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
				variant={detail ? 'body-extra-light-20' : 'body-extra-light-18'}
				color="grey4"
				style={{ flexBasis: '75%', fontSize: 20, margin: 0 }}
			>
				{title}
			</Typography>
			{!detail && (
				<div>
					<Typography variant="small-bold-12" color="grey4">
						{repliesCount.toFixed()}
					</Typography>
					<img src={iconReplies} style={{ maxHeight: 25, maxWidth: 25 }} />
				</div>
			)}
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
					e.stopPropagation()
					e.preventDefault()
					if (!isMyListing && (status === 'open' || detail) && onClickUser) {
						onClickUser(seeker)
					}
				}}
				style={{
					display: 'flex',
					flexDirection: 'row',
					alignItems: 'center',
					cursor:
						isMyListing || (status !== 'open' && !detail)
							? 'default'
							: 'pointer',
				}}
			>
				<Avatar
					avatar={seeker.avatar}
					size={detail ? 40 : 25}
					style={{ zIndex: 1 }}
				/>
				{status !== 'open' && !detail && (
					<Avatar
						avatar={provider?.avatar}
						size={25}
						style={{ marginLeft: -10, zIndex: 0 }}
					/>
				)}
				{(status === 'open' || detail) && (
					<Typography
						variant="small-bold-12"
						color={isMyListing ? 'grey4' : 'blue'}
						style={{ marginLeft: 8 }}
					>
						<>
							{formatName(seeker)} • {seeker.reputation} SWT
						</>
					</Typography>
				)}
				{status !== 'open' && !detail && (
					<Typography
						variant="small-bold-12"
						color="grey4"
						style={{ marginLeft: 8 }}
					>
						Deal {status}.
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
