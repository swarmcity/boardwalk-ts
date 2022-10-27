import { FullscreenLoading, IconButton, Input } from '@swarm-city/ui-library'
import { HTMLAttributes, useEffect, useState, createRef } from 'react'

// Pages
import { Status } from '../pages/marketplaces/services/marketplace-items'

// UI
import { Avatar } from '../ui/avatar'
import { getColor } from '../ui/colors'
import { ErrorModal } from '../ui/components/error-modal'
import { Container } from '../ui/container'
import type { Message, User } from '../ui/types'
import { ChatBubble } from '../ui/components/chat-bubble'
import { ChatConflictBubble } from '../ui/components/chat-conflict-bubble'

// Services
import { selectTempChatKey, useChatMessages } from '../services/chat'

// FIXME: Remove
const roleMarketplaceOwner: User = {
	address: '0x0',
	name: 'Baby Yoda',
	avatar:
		'https://c4.wallpaperflare.com/wallpaper/525/380/968/the-mandalorian-baby-yoda-hd-wallpaper-preview.jpg',
	reputation: 9000n,
}

// FIXME: Remove
const roleSeeker: User = {
	address: '0x1',
	reputation: 0n,
}

// FIXME: Remove
const roleProvider: User = {
	address: '0x2',
	reputation: 0n,
}

// FIXME: Remove
const templateMessages: Message[] = [
	{
		text: 'So where do I pick you up?',
		date: new Date(1666629211448),
		from: roleProvider,
	},
	{
		text: 'LAX, at the arrivals gate?',
		date: new Date(1666629315343),
		from: roleSeeker,
	},
	{
		text: 'LAX???!!',
		date: new Date(1666629315643),
		from: roleProvider,
	},
	{
		text: 'Oh my',
		date: new Date(1666629315653),
		from: roleProvider,
	},
	{
		text: "That's just too far for me, Tom!",
		date: new Date(1666629315733),
		from: roleProvider,
	},
	{
		text: '... ??',
		date: new Date(1666629505446),
		from: roleSeeker,
	},
	{
		text: "You're kidding, right?!",
		date: new Date(1666629506446),
		from: roleSeeker,
	},
	{
		text: "She's not willing to pick me up at LAX, eventhough that's exactly what I put in my request!",
		date: new Date(1666629639666),
		from: roleSeeker,
		isStartOfConflict: true,
	},
	{
		text: 'Lets resolve this with the force',
		date: new Date(1666629939666),
		from: roleMarketplaceOwner,
	},
	{
		text: 'Or a lightsaber combat',
		date: new Date(1666629949666),
		from: roleMarketplaceOwner,
	},
	{
		text: 'Your master trained you well...',
		date: new Date(1666629949666),
		from: roleProvider,
	},
	{
		text: 'What the heck is going on...',
		date: new Date(1666630607444),
		from: roleSeeker,
	},
]

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
	const [messages, setMessages] = useState<Message[]>([])
	const [scrolled, setScrolled] = useState(false)
	const [messageText, setMessageText] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [error, setError] = useState<Error | undefined>()
	const scrollElementRef = createRef<HTMLDivElement>()
	const inputElementRef = createRef<HTMLInputElement>()

	// FIXME: remove this, the status should come as prop or something
	const [status, setStatus] = useState(Status.Funded)

	const sendMessage = async () => {
		// Don't send empty messages
		if (!messageText) {
			return
		}
		try {
			const message = { from: user, text: messageText, date: new Date() }
			setIsSubmitting(true)

			// FIXME: replace this block with actual implementation
			const sleep = (time: number): Promise<void> =>
				new Promise((resolve) => setTimeout(() => resolve(), time))
			if (Math.random() > 0.5) {
				throw Error(
					'Failed to send message, this happens right now 50% of time for testing purposes'
				)
			}
			await sleep(2000)
			setMessages((m) => [...m, message])

			setMessageText('')
			inputElementRef.current?.focus()
			//FIXME: after succesfully sending message, should scroll the chat view to bottom, disabled for testing purposes
			// scrollElementRef?.current?.scrollIntoView()
		} catch (err) {
			setError(err as Error)
			console.error(err)
		}
		setIsSubmitting(false)
	}

	// FIXME: remove this, just for testing purposes
	// Progresively populates the messages with template data and logged in user
	useEffect(() => {
		if (user?.address) {
			const msgs = templateMessages.map((m) => {
				if (m.from.address === roleProvider.address) {
					return {
						...m,
						from: user.address === provider.address ? user : provider,
					}
				}
				if (m.from.address === roleSeeker.address) {
					return { ...m, from: user.address === seeker.address ? user : seeker }
				}
				return m
			})

			const timeouts = msgs.map((_m, i) =>
				setTimeout(() => {
					const ms = [...msgs].splice(0, i + 1)
					setMessages(ms)
					if (i === 0) {
						setStatus(Status.Funded)
					}
					if (ms[ms.length - 1].isStartOfConflict) {
						setStatus(Status.Disputed)
					}
				}, 1000 * i)
			)

			return () => timeouts.forEach(clearTimeout)
		}
	}, [user?.address])

	// This scrolls to the bottom of the chat if the user has not scrolled to some previous messages
	useEffect(() => {
		if (!scrolled) scrollElementRef?.current?.scrollIntoView()
	}, [messages])

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

	const chatMessages = useChatMessages(marketplace, item)
	console.log(chatMessages)

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
								{message.isStartOfConflict ? (
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
