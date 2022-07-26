import { useAccount, useBalance, useNetwork } from 'wagmi'
import { Link, Redirect } from '@reach/router'

// Routes and store
import { ACCOUNT_WALLET, LOGIN } from '../routes'
import { useStore } from '../store'

// Lib
import { formatBalance } from '../lib/tools'

// Assets
import avatarDefault from '../assets/imgs/avatar.svg?url'
import exit from '../assets/imgs/exit.svg?url'

// Types
import type { RouteComponentProps } from '@reach/router'

type Props = RouteComponentProps

export const Account = (_: Props) => {
	const [profile, setProfile] = useStore.profile()

	const { activeChain } = useNetwork()
	const symbol = activeChain?.nativeCurrency?.symbol

	const { data: account } = useAccount()
	const { data: balance } = useBalance({
		addressOrName: account?.address,
		watch: true,
	})

	if (!profile?.address) {
		return <Redirect to={LOGIN} noThrow />
	}

	return (
		<div class="bg-gray-lt account-wallet">
			<div class="icon-exit">
				<a style={{ cursor: 'pointer' }} onClick={() => setProfile()}>
					<img src={exit} />
				</a>
			</div>
			<div class="container">
				<main class="flex-space">
					<figure class="avatar avatar-sm">
						<img src={profile?.avatar || avatarDefault} alt="user avatar" />
						<figcaption>
							<a href="#" class="username">
								{profile?.username}
							</a>
							<div>
								<Link to={ACCOUNT_WALLET} className="wallet-balance">
									{balance ? formatBalance(balance) : `0.00 ${symbol}`}
								</Link>
							</div>
						</figcaption>
					</figure>
				</main>
			</div>
		</div>
	)
}
