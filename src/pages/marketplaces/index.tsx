import { useAccount, useBalance, useNetwork } from 'wagmi'
import { Link, Routes, Route } from 'react-router-dom'

// Routes and store
import { ACCOUNT_WALLET, LOGIN } from '../../routes'
import { useStore } from '../../store'

// Components
import { MarketplaceList } from './list'
import { Marketplace } from './marketplace'
import { MarketplaceListItem } from './list-item'
import { MarketplaceItem } from './item'

// Components
import { Redirect } from '../../components/redirect'
import { CreateAvatar } from '../../components/modals/create-avatar'

// Lib
import { formatBalance } from '../../lib/tools'

// Assets
import avatarDefault from '../../assets/imgs/avatar.svg?url'
import exit from '../../assets/imgs/exit.svg?url'

// Services
import { useSyncProfile } from '../../services/profile'
import { Container } from '../../ui/container'

export const Marketplaces = () => {
	const [profile, setProfile] = useStore.profile()

	const { chain } = useNetwork()
	const symbol = chain?.nativeCurrency?.symbol

	const { address } = useAccount()
	const { data: balance } = useBalance({
		addressOrName: address,
		watch: true,
	})

	// Keep the profile in sync
	useSyncProfile()

	if (!profile?.address) {
		return <Redirect to={LOGIN} />
	}

	return (
		<div className="bg-gray-lt account-wallet">
			<Container style={{ marginTop: 60 }}>
				<div
					style={{
						marginLeft: 40,
						marginRight: 40,
						display: 'flex',
						alignItems: 'center',
					}}
				>
					<div style={{ flexGrow: 1 }}>
						<figure className="avatar avatar-sm">
							<CreateAvatar>
								<img
									className="avatar-img"
									src={profile?.avatar || avatarDefault}
									alt="user avatar"
								/>
							</CreateAvatar>
							<figcaption>
								<a href="#" className="username">
									{profile?.username}
								</a>
								<div>
									<Link to={ACCOUNT_WALLET} className="wallet-balance">
										{balance ? formatBalance(balance) : `0.00 ${symbol}`}
									</Link>
								</div>
							</figcaption>
						</figure>
					</div>
					<a style={{ cursor: 'pointer' }} onClick={() => setProfile()}>
						<img src={exit} />
					</a>
				</div>
			</Container>

			<Routes>
				<Route element={<MarketplaceList />} path="/" />
				<Route element={<Marketplace />} path="/:id" />
				<Route element={<MarketplaceListItem />} path="/:id/add" />
				<Route element={<MarketplaceItem />} path="/:id/item/:item" />
			</Routes>
		</div>
	)
}
