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
const DEFAULT_SETTINGS = { bootstrap: { default: true } }

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
