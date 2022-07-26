import { BaseProvider } from '@ethersproject/providers'
import { EventEmitter } from 'eventemitter3'

export class AccountManager extends EventEmitter {
	#account: string | null
	#chainId: number | null
	#provider: BaseProvider | null

	constructor() {
		super()
		this.#account = null
		this.#chainId = null
		this.#provider = null
	}

	disconnect() {
		this.#account = null
		this.emit('disconnect')
	}

	get account() {
		return this.#account
	}

	set account(account: string | null) {
		this.#account = account
		this.emit('accountsChanged', [account])
	}

	get chainId() {
		return this.#chainId
	}

	set chainId(chainId: number | null) {
		this.#chainId = chainId
		this.emit('chainIdChanged', chainId)
	}

	get provider() {
		return this.#provider
	}

	set provider(provider: BaseProvider | null) {
		this.#provider = provider
		this.emit('providerChanged', provider)
	}
}
