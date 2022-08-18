import { multiaddr } from '@multiformats/multiaddr'
import { Waku } from 'js-waku'
import { createWaku, CreateOptions } from 'js-waku/lib/create_waku'
import {
	createContext,
	ReactNode,
	useContext,
	useEffect,
	useState,
} from 'react'

// Config
const DEFAULT_SETTINGS: CreateOptions = {}

export const WakuContext = createContext<{ waku?: Waku } | null>(null)

export const WakuProvider = ({
	children,
	settings,
}: {
	children: ReactNode
	settings?: CreateOptions
}) => {
	const [waku, setWaku] = useState<Waku>()

	useEffect(() => {
		// eslint-disable-next-line @typescript-eslint/no-extra-semi
		;(async () => {
			const waku = await createWaku(settings || DEFAULT_SETTINGS)
			setWaku(waku)

			await waku.start()
			await waku.dial(
				multiaddr(
					'/dns4/ws.waku.apyos.dev/tcp/443/wss/p2p/16Uiu2HAm5wH4dPAV6zDfrBHkWt9Wu9iiXT4ehHdUArDUbEevzmBY'
				)
			)
		})()
	}, [settings])

	return (
		<WakuContext.Provider value={{ waku }}>{children}</WakuContext.Provider>
	)
}

export const useWaku = () => {
	const context = useContext(WakuContext)
	if (!context) {
		throw new Error('no context')
	}
	return context
}
