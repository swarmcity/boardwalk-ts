import { Button, IconButton } from '@swarm-city/ui-library'
import { HTMLAttributes } from 'react'
import { Avatar } from '../avatar'
import { getColor } from '../colors'
import { Typography } from '../typography'
import { formatName } from '../utils'

interface User {
	name?: string
	address: string
	reputation: number
	avatar?: string
}

interface Props extends HTMLAttributes<HTMLDivElement> {
	title: string
	date: Date
	amount: number
	isMyReply?: boolean
	canOpen?: boolean
	isOpen?: boolean
	setIsOpen?: (value: boolean) => void
	isSelected?: boolean
	tokenName?: string
	onClickUser?: (user: User) => void
	selectProvider?: () => void
	confirmSelection?: () => void
	rejectSelection?: () => void
	user: User
}

export function Reply({
	title,
	date,
	amount,
	user,
	isMyReply,
	style,
	tokenName,
	canOpen,
	isOpen,
	setIsOpen,
	isSelected,
	onClickUser,
	selectProvider,
	confirmSelection,
	rejectSelection,
	...props
}: Props) {
	if (isOpen || isSelected) {
		return (
			<>
				<div
					style={{
						display: 'flex',
						flexDirection: 'column',
						padding: 30,
						marginLeft: 10,
						marginRight: 10,
						backgroundColor: getColor('white'),
						...style,
					}}
					{...props}
				>
					{!isSelected && (
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
								marginBottom: 20,
							}}
						>
							<IconButton
								variant="select"
								onClick={() => setIsOpen && setIsOpen(false)}
								style={{ transform: 'rotate(180deg)' }}
							/>
						</div>
					)}
					<div
						style={{
							display: 'flex',
							flexDirection: 'row',
							justifyContent: 'space-between',
							width: '100%',
						}}
					>
						<Typography variant="body-extra-light-18" color="grey4">
							{title}
						</Typography>
						<Typography
							variant="small-bold-12"
							color="grey4"
							style={{ marginTop: 5 }}
						>
							for {amount} {tokenName ?? 'DAI'}
						</Typography>
					</div>
					<Typography variant="small-light-10" color="grey2-light-text">
						{date.toLocaleString()}
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
							style={{
								display: 'flex',
								flexDirection: 'row',
								alignItems: 'center',
								cursor: isMyReply ? 'default' : 'pointer',
							}}
						>
							<Avatar avatar={user.avatar} size={25} />
							<Typography
								variant="small-bold-12"
								color={isMyReply ? 'grey4' : 'blue'}
								style={{ marginLeft: 8 }}
							>
								{formatName(user)} • {user.reputation} SWT
							</Typography>
						</div>
					</div>
					{!isSelected && (
						<Button style={{ marginTop: 30 }} size="large">
							select {formatName(user)}
						</Button>
					)}
				</div>
				{isSelected && (
					<div
						style={{
							marginLeft: 10,
							marginRight: 10,
							backgroundColor: getColor('blue'),
							padding: 30,
						}}
					>
						{!isMyReply && (
							<div
								style={{
									display: 'flex',
									flexDirection: 'column',
									alignItems: 'center',
									justifyContent: 'center',
									textAlign: 'center',
								}}
							>
								<Typography variant="body-bold-16" color="white">
									You selected {formatName(user)} to make a deal.
								</Typography>
								<Typography variant="small-light-12" color="white">
									Waiting for {formatName(user)} to respond
								</Typography>
								<Button style={{ marginTop: 30 }} size="large">
									unselect {formatName(user)}
								</Button>
							</div>
						)}
						{isMyReply && (
							<div
								style={{
									display: 'flex',
									flexDirection: 'column',
									alignItems: 'center',
									justifyContent: 'center',
									textAlign: 'center',
								}}
							>
								<Typography variant="body-bold-16" color="white">
									You were selected to make a deal. Do you accept?
								</Typography>
								<div
									style={{
										display: 'flex',
										flexDirection: 'row',
										marginTop: 44,
										justifyContent: 'center',
										alignItems: 'center',
									}}
								>
									<IconButton variant="cancel" style={{ marginRight: 15 }} />
									<IconButton variant="confirmAction" />
								</div>
							</div>
						)}
					</div>
				)}
			</>
		)
	}

	if (canOpen)
		return (
			<div
				style={{
					display: 'flex',
					flexDirection: 'column',
					marginLeft: 10,
					marginRight: 10,
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
						{title}
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
						<IconButton
							variant="select"
							onClick={() => setIsOpen && setIsOpen(true)}
						/>
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
						style={{
							display: 'flex',
							flexDirection: 'row',
							alignItems: 'center',
							cursor: isMyReply ? 'default' : 'pointer',
						}}
					>
						<Avatar avatar={user.avatar} size={25} />
						<div
							style={{
								display: 'flex',
								flexDirection: 'column',
								marginLeft: 8,
							}}
						>
							<Typography variant="small-light-10" color="grey2-light-text">
								{date.toLocaleString()}
							</Typography>
							<Typography
								variant="small-bold-12"
								color={isMyReply ? 'grey4' : 'blue'}
							>
								{formatName(user)} • {user.reputation} SWT
							</Typography>
						</div>
					</div>
					<Typography
						variant="small-bold-12"
						color="grey4"
						style={{ marginTop: 5 }}
					>
						for {amount} {tokenName ?? 'DAI'}
					</Typography>
				</div>
			</div>
		)

	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				marginLeft: 10,
				marginRight: 10,
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
					{title}
				</Typography>
				<Typography
					variant="small-bold-12"
					color="grey4"
					style={{ marginTop: 5 }}
				>
					for {amount} {tokenName ?? 'DAI'}
				</Typography>
			</div>
			<div
				style={{
					display: 'flex',
					flexDirection: 'row',
					alignItems: 'center',
					marginTop: 10,
					cursor: isMyReply ? 'default' : 'pointer',
				}}
			>
				<Avatar avatar={user.avatar} size={25} />
				<div
					style={{
						display: 'flex',
						flexDirection: 'column',
						marginLeft: 8,
					}}
				>
					<Typography variant="small-light-10" color="grey2-light-text">
						{date.toLocaleString()}
					</Typography>
					<Typography
						variant="small-bold-12"
						color={isMyReply ? 'grey4' : 'blue'}
					>
						{formatName(user)} • {user.reputation} SWT
					</Typography>
				</div>
			</div>
		</div>
	)
}
