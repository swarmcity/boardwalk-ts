import { useEffect, useMemo, useRef, useState } from 'preact/hooks'
import { Router } from '@reach/router'
import { JsonRpcProvider, WebSocketProvider } from '@ethersproject/providers'
import { WagmiConfig, createClient } from 'wagmi'

// Pages
import { Login } from './pages/login'
import { Home } from './pages/home'
import { SetupProfile } from './pages/create-account/setup-profile'
import { AccountCreated } from './pages/create-account/created'
import { ChoosePassword } from './pages/create-account/choose-password'
import { Backup } from './pages/create-account/backup'
import { Account } from './pages/account'
import { AccountRestore } from './pages/account-restore'
import { AccountWallet } from './pages/user-wallet/wallet'
import { AccountPublicWallet } from './pages/user-wallet/public'

// Components
import { PasswordSigner } from './components/modals/password-signer'

// Routes, store and config
import * as ROUTES from './routes'
import { useStore } from './store'
import { WAGMI_CHAIN, WAGMI_NETWORK } from './config'

// Lib
import { EthersConnector } from './lib/ethers-injector'
import { AccountManager } from './lib/account-manager'

// Types
import type { PasswordSignerRef } from './components/modals/password-signer'
import type { Ref } from 'preact/hooks'

const accountManager = new AccountManager()
const getClient = (ref: Ref<PasswordSignerRef>) => {
	return createClient({
		connectors: [
			new EthersConnector({
				chains: [WAGMI_CHAIN],
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
		provider: new JsonRpcProvider(WAGMI_CHAIN.rpcUrls.default, WAGMI_NETWORK),
		webSocketProvider: new WebSocketProvider(
			WAGMI_CHAIN.rpcUrls.websocket,
			WAGMI_NETWORK
		),
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
			<PasswordSigner ref={ref} />
			<Router>
				<Login path={ROUTES.LOGIN} />
				<SetupProfile path={ROUTES.CREATE_ACCOUNT} />
				<AccountCreated path={ROUTES.ACCOUNT_CREATED} />
				<ChoosePassword path={ROUTES.ACCOUNT_PASSWORD} />
				<Backup path={ROUTES.ACCOUNT_BACKUP} />
				<Account path={ROUTES.ACCOUNT} />
				<AccountRestore path={ROUTES.ACCOUNT_RESTORE} />
				<Home path={ROUTES.HOME} />
				<AccountWallet path={`${ROUTES.ACCOUNT_WALLET}/*`} />
				<AccountPublicWallet path={ROUTES.ACCOUNT_PUBLIC_WALLET} />
			</Router>
		</WagmiConfig>
	)
}
