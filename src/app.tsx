import { useEffect, useMemo, useRef, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { WagmiConfig, createClient, configureChains, Chain } from 'wagmi'
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc'

// Pages
import { Login } from './pages/login'
import { Home } from './pages/home'
import { SetupProfile } from './pages/create-account/setup-profile'
import { AccountCreated } from './pages/create-account/created'
import { ChoosePassword } from './pages/create-account/choose-password'
import { Backup } from './pages/create-account/backup'
import { Marketplaces } from './pages/marketplaces'
import { AccountRestore } from './pages/account-restore'
import { AccountWallet } from './pages/user-wallet/wallet'
import { AccountPublicWallet } from './pages/user-wallet/public'

// Components
import { PasswordSigner } from './components/modals/password-signer'

// Routes, store and config
import * as ROUTES from './routes'
import { useStore } from './store'
import { WAGMI_CHAIN } from './config'

// Lib
import { EthersConnector } from './lib/ethers-injector'
import { AccountManager } from './lib/account-manager'

// Hooks
import { WakuProvider } from './hooks/use-waku'

// Types
import type { PasswordSignerRef } from './components/modals/password-signer'
import type { RefObject } from 'react'
import { User } from './pages/user'

const { chains, provider, webSocketProvider } = configureChains(
	[WAGMI_CHAIN],
	[
		jsonRpcProvider({
			rpc: (chain: Chain) => ({
				http: chain.rpcUrls.default,
				webSocket: chain.rpcUrls.webSocket,
			}),
		}),
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
				<PasswordSigner ref={ref} />
				<Routes>
					<Route element={<Login />} path={ROUTES.LOGIN} />
					<Route element={<SetupProfile />} path={ROUTES.CREATE_ACCOUNT} />
					<Route element={<AccountCreated />} path={ROUTES.ACCOUNT_CREATED} />
					<Route element={<ChoosePassword />} path={ROUTES.ACCOUNT_PASSWORD} />
					<Route element={<Backup />} path={ROUTES.ACCOUNT_BACKUP} />
					<Route element={<Marketplaces />} path={`${ROUTES.MARKETPLACES}/*`} />
					<Route element={<AccountRestore />} path={ROUTES.ACCOUNT_RESTORE} />
					<Route element={<Home />} path={ROUTES.HOME} />
					<Route element={<User />} path={ROUTES.USER(':id')} />
					<Route
						element={<AccountWallet />}
						path={`${ROUTES.ACCOUNT_WALLET}/*`}
					/>
					<Route
						element={<AccountPublicWallet />}
						path={ROUTES.ACCOUNT_PUBLIC_WALLET}
					/>
				</Routes>
			</WakuProvider>
		</WagmiConfig>
	)
}
