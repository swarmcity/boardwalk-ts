import { Link, useNavigate } from 'react-router-dom'
import type { HTMLAttributes } from 'react'

// Routes and store
import { ACCOUNT_WALLET, LOGIN, ACCOUNT } from '../../routes'
import { useStore } from '../../store'

// Services
import { useSyncProfile } from '../../services/profile'
import { Container } from '../../ui/container'
import { Avatar } from '../../ui/avatar'
import { Typography } from '../../ui/typography'
import { tokenToDecimals, formatName, amountToString } from '../../ui/utils'
import { Plus } from '../../ui/icons/plus'
import { getColor } from '../../ui/colors'
import {
	useTokenBalanceOf,
	useTokenDecimals,
	useTokenName,
} from './services/marketplace'

import { APP_TOKEN } from '../../config'

type Props = HTMLAttributes<HTMLDivElement>

export const UserAccount = ({ children, style, ...props }: Props) => {
	const [profile] = useStore.profile()
	const navigate = useNavigate()

	const tokenName = useTokenName(APP_TOKEN)
	const tokenBalance = useTokenBalanceOf(APP_TOKEN, profile?.address)
	const { decimals } = useTokenDecimals(APP_TOKEN)

	const userBalance = tokenToDecimals(tokenBalance ?? 0n, decimals)

	// Keep the profile in sync
	useSyncProfile()

	return (
		<Container style={{ marginTop: 60, marginBottom: 20, ...style }} {...props}>
			<div
				style={{
					marginLeft: 40,
					marginRight: 40,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
				}}
			>
				{!profile?.address && (
					<div
						style={{
							cursor: 'pointer',
						}}
						onClick={() => navigate(LOGIN)}
					>
						<Avatar size={40} style={{ marginRight: 10 }} />
						<div
							style={{
								width: 30,
								height: 30,
								backgroundColor: getColor('blue'),
								borderRadius: '50%',
								position: 'relative',
								marginTop: -25,
								marginLeft: 28,
								display: 'flex',
								justifyContent: 'center',
								alignItems: 'center',
							}}
						>
							<Plus />
						</div>
					</div>
				)}
				{profile?.address && (
					<div style={{ display: 'flex', alignItems: 'center' }}>
						<Link to={ACCOUNT}>
							<Avatar
								avatar={profile?.avatar}
								size={40}
								style={{ marginRight: 10 }}
							/>
						</Link>
						<div style={{ display: 'flex', flexDirection: 'column' }}>
							<Link to={ACCOUNT}>
								<Typography variant="small-bold-12" color="grey4">
									{formatName({
										address: profile.address,
										name: profile.username,
									})}
								</Typography>
							</Link>
							<Link to={ACCOUNT_WALLET}>
								<Typography variant="header-22" color="yellow">
									{amountToString(userBalance)} {tokenName}
								</Typography>
							</Link>
						</div>
					</div>
				)}
				{children}
			</div>
		</Container>
	)
}
