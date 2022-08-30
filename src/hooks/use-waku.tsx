import { multiaddr } from '@multiformats/multiaddr'
import { waitForRemotePeer, Waku } from 'js-waku'
import { createWaku, CreateOptions } from 'js-waku/lib/create_waku'
import {
	createContext,
	ReactNode,
	useContext,
	useEffect,
	useState,
} from 'react'

// Types
import type { Protocols } from 'js-waku'

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

export const useWakuContext = () => {
	const context = useContext(WakuContext)
	if (!context) {
		throw new Error('no context')
	}
	return context
}

export const useWaku = (protocols?: Protocols[]) => {
	const { waku } = useWakuContext()
	const [waiting, setWaiting] = useState(true)

	useEffect(() => {
		if (!waku) {
			return
		}

		waitForRemotePeer(waku, protocols).then(() => setWaiting(false))
	}, [waku])

	return { waku, waiting }
}
