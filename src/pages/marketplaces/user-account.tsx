import { useAccount, useBalance, useNetwork } from 'wagmi'
import { Link, useNavigate } from 'react-router-dom'
import type { HTMLAttributes } from 'react'

// Routes and store
import { ACCOUNT_WALLET, LOGIN } from '../../routes'
import { useStore } from '../../store'

// Components
import { CreateAvatar } from '../../components/modals/create-avatar'

// Services
import { useSyncProfile } from '../../services/profile'
import { Container } from '../../ui/container'
import { Avatar } from '../../ui/avatar'
import { Typography } from '../../ui/typography'
import { formatMoney, formatName } from '../../ui/utils'
import { Plus } from '../../ui/icons/plus'
import { getColor } from '../../ui/colors'

type Props = HTMLAttributes<HTMLDivElement>

export const UserAccount = ({ children, style, ...props }: Props) => {
	const [profile] = useStore.profile()
	const navigate = useNavigate()

	const { chain } = useNetwork()
	const symbol = chain?.nativeCurrency?.symbol

	const { address } = useAccount()
	const { data: balance } = useBalance({
		addressOrName: address,
		watch: true,
	})

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
						<CreateAvatar>
							<Avatar
								avatar={profile?.avatar}
								size={40}
								style={{ marginRight: 10 }}
							/>
						</CreateAvatar>
						<div style={{ display: 'flex', flexDirection: 'column' }}>
							<Typography variant="small-bold-12" color="grey4">
								{formatName({
									address: profile.address,
									name: profile.username,
								})}
							</Typography>
							<Link to={ACCOUNT_WALLET}>
								<Typography variant="header-22" color="yellow">
									{formatMoney(balance?.value ?? 0n, balance?.decimals).toFixed(
										4
									)}{' '}
									{symbol}
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
