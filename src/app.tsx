import { useEffect, useMemo, useRef, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { WagmiConfig, createClient, configureChains } from 'wagmi'
import { alchemyProvider } from 'wagmi/providers/alchemy'

// Pages
import { Login } from './pages/login'
import { Home } from './pages/home'
import { SetupProfile } from './pages/create-account/setup-profile'
import { AccountCreated } from './pages/create-account/created'
import { ChoosePassword } from './pages/create-account/choose-password'
import { Backup } from './pages/create-account/backup'
import { AccountRestore } from './pages/account-restore'
import { AccountWallet } from './pages/user-wallet/wallet'
import { AccountPrivateWallet } from './pages/user-wallet/private'
import { Account } from './pages/account'
import { User } from './pages/user'
import { AccountPublicWallet } from './pages/user-wallet/public'
import { Marketplace } from './pages/marketplaces/marketplace'
import { MarketplaceList } from './pages/marketplaces/list'
import { MarketplaceListItem } from './pages/marketplaces/list-item'
import { MarketplaceItem } from './pages/marketplaces/item'

// Components
import { PasswordSigner } from './components/modals/password-signer'

// Routes, store and config
import * as ROUTES from './routes'
import { useStore } from './store'
import { WAGMI_CHAIN } from './config'

// Lib
import { EthersConnector } from './lib/ethers-injector'
import { AccountManager } from './lib/account-manager'
import { publicProvider } from './lib/public-with-ws'

// Hooks
import { WakuProvider } from './hooks/use-waku'

// Types
import type { PasswordSignerRef } from './components/modals/password-signer'
import type { RefObject } from 'react'

// Services
import { ProfileCacheProvider } from './services/profile'
import { ProfilePictureCacheProvider } from './services/profile-picture'

const { chains, provider, webSocketProvider } = configureChains(
	[WAGMI_CHAIN],
	[
		alchemyProvider({
			apiKey: 'GPR_qF9l_vj-iDb1Kdg3cjDBB-ktJ7Lt',
		}),
		publicProvider(),
	]
)

const accountManager = new AccountManager()
const getClient = (ref: RefObject<PasswordSignerRef>) => {
	return createClient({
		connectors: [
			new EthersConnector({
				chains,
				options: {
					accountManager,
					getSigner: async () => {
						if (!ref.current) {
							throw new Error('no ref')
						}
						return await ref.current.getSigner()
					},
				},
			}),
		],
		provider,
		webSocketProvider,
	})
}

export const App = () => {
	// Wagmi
	const [loading, setLoading] = useState(true)
	const ref = useRef<PasswordSignerRef>(null)
	const client = useMemo(() => getClient(ref), [ref])

	// Profile
	const [profile] = useStore.profile()

	// Automatically log the user into wagmi
	useEffect(() => {
		if (!profile?.address) {
			setLoading(false)
			return
		}

		accountManager.account = profile.address
		client.autoConnect().finally(() => setLoading(false))
	}, [client, profile?.address])

	if (loading) {
		return null
	}

	return (
		<WagmiConfig client={client}>
			<WakuProvider>
				<ProfilePictureCacheProvider>
					<ProfileCacheProvider>
						<PasswordSigner ref={ref} />
						<Routes>
							<Route element={<Login />} path={ROUTES.LOGIN} />
							<Route element={<SetupProfile />} path={ROUTES.CREATE_ACCOUNT} />
							<Route element={<Account />} path={ROUTES.ACCOUNT} />
							<Route
								element={<AccountCreated />}
								path={ROUTES.ACCOUNT_CREATED}
							/>
							<Route
								element={<ChoosePassword />}
								path={ROUTES.ACCOUNT_PASSWORD}
							/>
							<Route element={<Backup />} path={ROUTES.ACCOUNT_BACKUP} />
							<Route element={<MarketplaceList />} path={ROUTES.MARKETPLACES} />
							<Route
								element={<Marketplace />}
								path={ROUTES.MARKETPLACE(':id')}
							/>
							<Route
								element={<MarketplaceListItem />}
								path={ROUTES.MARKETPLACE_ADD(':id')}
							/>
							<Route
								element={<MarketplaceItem />}
								path={ROUTES.MARKETPLACE_ITEM(':id', ':item')}
							/>
							<Route
								element={<AccountRestore />}
								path={ROUTES.ACCOUNT_RESTORE}
							/>
							<Route element={<Home />} path={ROUTES.HOME} />
							<Route element={<User />} path={ROUTES.USER(':id')} />
							<Route
								element={<AccountWallet />}
								path={`${ROUTES.ACCOUNT_WALLET}/*`}
							/>
							<Route
								element={<AccountPrivateWallet />}
								path={ROUTES.ACCOUNT_PRIVATE_WALLET}
							/>
							<Route
								element={<AccountPublicWallet />}
								path={ROUTES.ACCOUNT_PUBLIC_WALLET}
							/>
						</Routes>
					</ProfileCacheProvider>
				</ProfilePictureCacheProvider>
			</WakuProvider>
		</WagmiConfig>
	)
}
