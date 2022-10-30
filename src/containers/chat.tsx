import { FullscreenLoading, IconButton, Input } from '@swarm-city/ui-library'
import { HTMLAttributes, useEffect, useState, createRef, useMemo } from 'react'

// Pages
import { Status } from '../pages/marketplaces/services/marketplace-items'

// UI
import { Avatar } from '../ui/avatar'
import { getColor } from '../ui/colors'
import { ErrorModal } from '../ui/components/error-modal'
import { Container } from '../ui/container'
import type { User } from '../ui/types'
import { ChatBubble } from '../ui/components/chat-bubble'
import { ChatConflictBubble } from '../ui/components/chat-conflict-bubble'

// Services
import {
	postChatMessage,
	selectTempChatKey,
	useChatMessages,
} from '../services/chat'
import { Protocols } from 'js-waku'
import { useWaku } from '../hooks/use-waku'

// FIXME: Remove
const roleMarketplaceOwner: User = {
	address: '0x0',
	name: 'Baby Yoda',
	avatar:
		'https://c4.wallpaperflare.com/wallpaper/525/380/968/the-mandalorian-baby-yoda-hd-wallpaper-preview.jpg',
	reputation: 9000n,
}

interface Props extends HTMLAttributes<HTMLDivElement> {
	hide: () => void
	user: User
	seeker: User
	provider: User
	marketplaceOwner: User
	marketplace: string
	item: bigint
}

function ChatModal({
	hide,
	user,
	provider,
	seeker,
	marketplaceOwner,
	marketplace,
	item,
	...props
}: Props) {
	const { waku } = useWaku([Protocols.LightPush])
	const [scrolled, setScrolled] = useState(false)
	const [messageText, setMessageText] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [error, setError] = useState<Error | undefined>()
	const scrollElementRef = createRef<HTMLDivElement>()
	const inputElementRef = createRef<HTMLInputElement>()
	const them = user.address === seeker.address ? provider : seeker

	// FIXME: remove this, the status should come as prop or something
	const [status] = useState(Status.Funded)

	const sendMessage = async () => {
		// Don't send empty messages
		if (!messageText || !waku) {
			return
		}

		try {
			setIsSubmitting(true)

			await postChatMessage(waku, marketplace, item, { message: messageText })

			setMessageText('')
			inputElementRef.current?.focus()

			scrollElementRef?.current?.scrollIntoView()
		} catch (err) {
			setError(err as Error)
			console.error(err)
		}
		setIsSubmitting(false)
	}

	// Decides whether the user scrolled past our object at the bottom of the chat
	useEffect(() => {
		if (scrollElementRef.current) {
			const el = scrollElementRef.current
			const observer = new IntersectionObserver(([ob]) =>
				setScrolled(!ob.isIntersecting)
			)
			observer.observe(el)
			return () => {
				observer.unobserve(el)
			}
		}
	}, [scrollElementRef.current])

	useEffect(() => {
		selectTempChatKey(marketplace, item, provider.address)
	}, [marketplace, item, provider])

	const { items } = useChatMessages(marketplace, item)
	const messages = useMemo(
		() =>
			items.map(({ message, from }) => ({
				text: message,
				date: new Date(),
				from: from === 'me' ? user : them,
			})),
		[items]
	)

	// This scrolls to the bottom of the chat if the user has not scrolled to some previous messages
	useEffect(() => {
		if (!scrolled) scrollElementRef?.current?.scrollIntoView()
	}, [messages])

	if (user === undefined) {
		return <FullscreenLoading>Loading your chat...</FullscreenLoading>
	}

	return (
		<div
			style={{
				width: '100vw',
				height: '100vh',
				position: 'fixed',
				overflow: 'hidden',
				backgroundColor: getColor('white'),
				display: 'flex',
				flexDirection: 'column',
				zIndex: 50,
				top: 0,
				left: 0,
			}}
			{...props}
		>
			{error && <ErrorModal onClose={() => setError(undefined)} />}
			<Container>
				<div
					style={{
						paddingLeft: 10,
						paddingRight: 10,
						display: 'flex',
						flexDirection: 'column',
						justifyContent: 'stretch',
						height: '100vh',
					}}
				>
					<div
						style={{
							display: 'flex',
							flexDirection: 'row',
							justifyContent: 'space-between',
							alignItems: 'center',
							paddingTop: 30,
							paddingBottom: 10,
							backgroundColor: getColor('white'),
						}}
					>
						<div
							style={{ display: 'flex', flexDirection: 'row', paddingLeft: 30 }}
						>
							<Avatar avatar={seeker.avatar} size={24} style={{ zIndex: 2 }} />
							<Avatar
								avatar={provider.avatar}
								size={24}
								style={{ marginLeft: -5, zIndex: 1 }}
							/>
							{status === Status.Disputed && (
								<Avatar
									avatar={marketplaceOwner.avatar}
									size={24}
									style={{ marginLeft: -5, zIndex: 0 }}
								/>
							)}
						</div>
						<div>
							<IconButton variant="close" onClick={hide} />
						</div>
					</div>
					<div
						style={{
							flexGrow: 1,
							overflowX: 'hidden',
							display: 'flex',
							flexDirection: 'column',
							paddingLeft: 20,
							paddingRight: 20,
						}}
					>
						<div style={{ flexGrow: 1 }} />
						{messages.map((message, index) => (
							<div
								key={index}
								style={{
									marginTop:
										index !== 0 &&
										message.from.address !== messages[index - 1].from.address
											? 30
											: 10,
								}}
							>
								{/* eslint-disable-next-line no-constant-condition */}
								{false /*message.isStartOfConflict*/ ? (
									<ChatConflictBubble
										message={message}
										user={user}
										marketplaceOwner={marketplaceOwner}
									/>
								) : (
									<ChatBubble message={message} user={user} />
								)}
							</div>
						))}
						<div style={{ marginBottom: 20 }} ref={scrollElementRef} />
					</div>
					<div
						style={{
							borderTop: `1px solid ${getColor('grey2')}`,
							padding: 30,
							display: 'flex',
							flexDirection: 'row',
							justifyContent: 'space-between',
							alignItems: 'center',
						}}
					>
						<div style={{ width: 40, height: 40 }}>
							<Avatar avatar={user?.avatar} size={40} />
						</div>
						<div
							style={{
								flexGrow: 1,
								flexShrink: 1,
								paddingLeft: 20,
								paddingRight: 30,
							}}
						>
							<form
								onSubmit={(e) => {
									e.preventDefault()
									sendMessage()
								}}
							>
								<Input
									autoFocus
									id="message"
									disabled={isSubmitting}
									value={messageText}
									onChange={(event) =>
										setMessageText(event.currentTarget.value)
									}
									autoComplete="off"
									ref={inputElementRef}
								/>
							</form>
						</div>
						<div style={{ width: 50, height: 50 }}>
							<IconButton
								variant="confirmSend"
								onClick={sendMessage}
								disabled={isSubmitting || !messageText}
							/>
						</div>
					</div>
				</div>
			</Container>
		</div>
	)
}

export interface ChatProps {
	user: User
	seeker: User
	provider: User
	marketplace: string
	item: bigint
}

/**
 * This is deliberately a separate component because if the Chat is not shown, it does not load any data from hooks. It's just a button
 */
export function Chat({ user, seeker, provider, marketplace, item }: ChatProps) {
	const [shown, setShown] = useState(false)

	if (shown)
		return (
			<ChatModal
				hide={() => setShown(false)}
				user={user}
				seeker={seeker}
				provider={provider}
				marketplaceOwner={roleMarketplaceOwner}
				marketplace={marketplace}
				item={item}
			/>
		)

	return <IconButton variant="chat" onClick={() => setShown(true)} />
}
