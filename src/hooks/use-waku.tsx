import { multiaddr } from '@multiformats/multiaddr'
import { waitForRemotePeer, Waku, Protocols } from 'js-waku'
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

export const WakuContext = createContext<{
	waku?: Waku
	availableProtocols: Set<Protocols>
	addAvailableProtocols: (protocols: Protocols[]) => void
} | null>(null)

export const WakuProvider = ({
	children,
	settings,
}: {
	children: ReactNode
	settings?: CreateOptions
}) => {
	const [waku, setWaku] = useState<Waku>()
	const [availableProtocols, setAvailableProtocols] = useState<Set<Protocols>>(
		new Set()
	)
	const addAvailableProtocols = (protocols: Protocols[]) => {
		setAvailableProtocols(new Set([...availableProtocols, ...protocols]))
	}

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
		<WakuContext.Provider
			value={{ waku, availableProtocols, addAvailableProtocols }}
		>
			{children}
		</WakuContext.Provider>
	)
}

export const useWakuContext = () => {
	const context = useContext(WakuContext)
	if (!context) {
		throw new Error('no context')
	}
	return context
}

// NOTE: This might cause issues if we lose a peer on the way, but there's an upstream issue
// TODO: Make this more robust
export const useWaku = (protocols?: Protocols[]) => {
	const { waku, availableProtocols, addAvailableProtocols } = useWakuContext()
	const [waiting, setWaiting] = useState(true)

	console.log({ availableProtocols })

	useEffect(() => {
		if (!waku) {
			return
		}

		if (!protocols) {
			protocols = [Protocols.Relay]
		}

		// If all protocols are available, we're good
		if (protocols.some((protocol) => availableProtocols.has(protocol))) {
			setWaiting(false)
			return
		}

		// Fetch the protocols that aren't available yet
		const diff = protocols.filter(
			(protocol) => !availableProtocols.has(protocol)
		)

		// Wait for the missing protocols to be available
		waitForRemotePeer(waku, diff).then(() => {
			addAvailableProtocols(diff)
			setWaiting(false)
		})
	}, [waku])

	return { waku, waiting }
}
