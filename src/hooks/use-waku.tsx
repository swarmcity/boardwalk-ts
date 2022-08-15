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
		wantedNodeCapabilityCount: {
			relay: 1,
			store: 1,
			filter: 1,
			lightPush: 1,
		},
		enrUrl:
			'enr:-KO4QPkJGPjc3HSWORbSSGwrRPYCQw6KT3hoTtq9wRETQ0iESuRaEwq9gr5bMn53X07_SyWufwZ5jGE6yXf7Y9sArXQBgmlkgnY0gmlwhLyl4beKbXVsdGlhZGRyc4wACgS8peG3Bh9A3QOJc2VjcDI1NmsxoQIZ9LAuNEcxirgJRqJj0FedIiUS7AA1A0URms-svcgYJIN0Y3CC6mCFd2FrdTIP',
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
