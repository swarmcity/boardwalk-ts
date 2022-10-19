import { IconButton } from '@swarm-city/ui-library'
import { HTMLAttributes } from 'react'
import { Avatar } from '../avatar'
import { getColor } from '../colors'
import { Typography } from '../typography'
import { amountToString, formatName } from '../utils'

import type { User, Reply as ReplyType } from '../types'

interface Props extends HTMLAttributes<HTMLDivElement> {
	reply: ReplyType
	canOpen?: boolean
	onSelectClick?: () => void
	showSelectBtn?: boolean
	selected?: boolean
	onClickUser?: (user: User) => void
}

export function Reply({
	reply,
	style,
	showSelectBtn,
	selected,
	onSelectClick,
	onClickUser,
	...props
}: Props) {
	if (selected) {
		return (
			<>
				<div
					style={{
						display: 'flex',
						flexDirection: 'column',
						padding: 30,
						backgroundColor: getColor('white'),
						...style,
					}}
					{...props}
				>
					<div
						style={{
							display: 'flex',
							flexDirection: 'row',
							justifyContent: 'space-between',
							width: '100%',
						}}
					>
						<Typography variant="body-extra-light-18" color="grey4">
							{reply.text}
						</Typography>
						<Typography
							variant="small-bold-12"
							color="grey4"
							style={{ marginTop: 5 }}
						>
							for {amountToString(reply.amount)} {reply.tokenName}
						</Typography>
					</div>
					<Typography variant="small-light-10" color="grey2-light-text">
						{reply.date.toLocaleString()}
					</Typography>
					<div
						style={{
							display: 'flex',
							flexDirection: 'row',
							marginTop: 10,
							justifyContent: 'space-between',
							alignItems: 'center',
							width: '100%',
						}}
					>
						<div
							onClick={() =>
								!reply.isMyReply && onClickUser && onClickUser(reply.user)
							}
							style={{
								display: 'flex',
								flexDirection: 'row',
								alignItems: 'center',
								cursor: reply.isMyReply ? 'default' : 'pointer',
							}}
						>
							<Avatar avatar={reply.user.avatar} size={25} />
							<Typography
								variant="small-bold-12"
								color={reply.isMyReply ? 'grey4' : 'blue'}
								style={{ marginLeft: 8 }}
							>
								<>
									{formatName(reply.user)} • {reply.user.reputation.toString()}{' '}
									SWR
								</>
							</Typography>
						</div>
					</div>
				</div>
			</>
		)
	}

	if (showSelectBtn)
		return (
			<div
				style={{
					display: 'flex',
					flexDirection: 'column',
					backgroundColor: getColor('white'),
					padding: 30,
					...style,
				}}
				{...props}
			>
				<div
					style={{
						display: 'flex',
						flexDirection: 'row',
						justifyContent: 'space-between',
						width: '100%',
					}}
				>
					<Typography variant="body-extra-light-18" color="grey4">
						{reply.text}
					</Typography>
					<div
						style={{
							backgroundColor: getColor('white'),
							borderRadius: '50%',
							width: 37,
							height: 37,
							boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.25)',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							cursor: 'pointer',
						}}
					>
						<IconButton variant="select" onClick={onSelectClick} />
					</div>
				</div>
				<div
					style={{
						display: 'flex',
						flexDirection: 'row',
						marginTop: 10,
						justifyContent: 'space-between',
						alignItems: 'center',
						width: '100%',
					}}
				>
					<div
						onClick={() =>
							!reply.isMyReply && onClickUser && onClickUser(reply.user)
						}
						style={{
							display: 'flex',
							flexDirection: 'row',
							alignItems: 'center',
							cursor: reply.isMyReply ? 'default' : 'pointer',
						}}
					>
						<Avatar avatar={reply.user.avatar} size={25} />
						<div
							style={{
								display: 'flex',
								flexDirection: 'column',
								marginLeft: 8,
							}}
						>
							<Typography variant="small-light-10" color="grey2-light-text">
								{reply.date.toLocaleString()}
							</Typography>
							<Typography
								variant="small-bold-12"
								color={reply.isMyReply ? 'grey4' : 'blue'}
							>
								<>
									{formatName(reply.user)} • {reply.user.reputation.toString()}{' '}
									SWR
								</>
							</Typography>
						</div>
					</div>
					<Typography
						variant="small-bold-12"
						color="grey4"
						style={{ marginTop: 5 }}
					>
						for {amountToString(reply.amount)} {reply.tokenName}
					</Typography>
				</div>
			</div>
		)

	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				padding: 30,
				backgroundColor: getColor('white'),
				...style,
			}}
			{...props}
		>
			<div
				style={{
					display: 'flex',
					flexDirection: 'row',
					justifyContent: 'space-between',
					width: '100%',
				}}
			>
				<Typography variant="body-extra-light-18" color="grey4">
					{reply.text}
				</Typography>
				<Typography
					variant="small-bold-12"
					color="grey4"
					style={{ marginTop: 5 }}
				>
					for {amountToString(reply.amount)} {reply.tokenName}
				</Typography>
			</div>
			<div
				onClick={() =>
					!reply.isMyReply && onClickUser && onClickUser(reply.user)
				}
				style={{
					display: 'flex',
					flexDirection: 'row',
					alignItems: 'center',
					marginTop: 10,
					cursor: reply.isMyReply ? 'default' : 'pointer',
				}}
			>
				<Avatar avatar={reply.user.avatar} size={25} />
				<div
					style={{
						display: 'flex',
						flexDirection: 'column',
						marginLeft: 8,
					}}
				>
					<Typography variant="small-light-10" color="grey2-light-text">
						{reply.date.toLocaleString()}
					</Typography>
					<Typography
						variant="small-bold-12"
						color={reply.isMyReply ? 'grey4' : 'blue'}
					>
						<>
							{formatName(reply.user)} • {reply.user.reputation.toString()} SWR
						</>
					</Typography>
				</div>
			</div>
		</div>
	)
}
