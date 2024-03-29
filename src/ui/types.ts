import { KeyExchange } from '../protos/key-exchange'

export interface User {
	address: string // Ethereum address
	reputation: bigint
	name?: string
	avatar?: string // Reference to avatar that directly resolves to image
}
export enum Status {
	None,
	Open,
	Funded,
	Done,
	Disputed,
	Resolved,
	Cancelled,
}

export interface Reply {
	text: string
	date: Date
	amount: number
	isMyReply?: boolean
	tokenName?: string
	user: User
	keyExchange: KeyExchange
}

export interface Request {
	id: string
	price: number
	description: string
	date: Date
	status: Status
	fee: number
	myReply?: Reply
	replies: Reply[]
	seeker: User
	provider?: User
}

export interface Icon {
	fill?: string
	size?: number
}

export interface Message {
	text: string
	date: Date
	from: User
	isStartOfConflict?: true
}
