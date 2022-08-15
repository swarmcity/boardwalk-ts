import { Waku } from 'js-waku'
import {
	createContext,
	ReactNode,
	useContext,
	useEffect,
	useState,
} from 'react'

// Types
import type { CreateOptions } from 'js-waku/build/main/lib/waku'

// Config
const DEFAULT_SETTINGS = {
	bootstrap: {
		peers: [
			'/dns4/ws.waku.apyos.dev/tcp/443/wss/p2p/16Uiu2HAkwAzaMhKTikSVD1djSieWNoJ9jq63kmJG21mmizT8jQDq',
		],
	},
}

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
		Waku.create(settings || DEFAULT_SETTINGS).then(setWaku)
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
