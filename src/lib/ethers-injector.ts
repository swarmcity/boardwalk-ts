import { getAddress } from '@ethersproject/address'
import { BaseProvider, JsonRpcProvider } from '@ethersproject/providers'
import { Connector, ConnectorNotFoundError, Chain } from 'wagmi'
import { SwitchChainError } from '@wagmi/core'

// Types
import type { Wallet } from '@ethersproject/wallet'
import type { Provider } from '@ethersproject/providers'

// Lib
import { AccountManager } from './account-manager'

export type EthersConnectorOptions = {
	accountManager: AccountManager
	getSigner(): Promise<Wallet>
}

function normalizeChainId(chainId: string | number) {
	if (typeof chainId === 'string') {
		return Number.parseInt(
			chainId,
			chainId.trim().substring(0, 2) === '0x' ? 16 : 10
		)
	}

	return chainId
}

export class EthersConnector extends Connector<
	Provider,
	EthersConnectorOptions,
	Wallet
> {
	readonly id = 'ethers'
	readonly name = 'Ethers'
	readonly ready = true

	#manager: AccountManager
	#provider?: BaseProvider

	constructor({
		chains,
		options,
	}: {
		chains: Chain[]
		options: EthersConnectorOptions
	}) {
		super({ chains, options })
		this.#manager = options.accountManager
	}

	async connect() {
		this.#manager.on('disconnect', this.onDisconnect)
		this.#manager.on('chainChanged', this.onChainChanged)
		this.#manager.on('accountsChanged', this.onAccountsChanged)

		const [id, account, provider] = await Promise.all([
			this.getChainId(),
			this.getAccount(),
			this.getProvider(),
		])

		return {
			account,
			chain: { id, unsupported: false },
			provider,
		}
	}

	async disconnect() {
		this.#manager.off('disconnect', this.onDisconnect)
		this.#manager.off('chainChanged', this.onChainChanged)
		this.#manager.off('accountsChanged', this.onAccountsChanged)

		this.#manager.account = null
	}

	async getAccount() {
		return this.#returnOrThrow(this.#manager.account)
	}

	async getChainId() {
		const provider = await this.getProvider()
		const network = await provider.getNetwork()
		return normalizeChainId(network.chainId)
	}

	async getProvider() {
		if (this.#manager.provider) {
			return this.#manager.provider
		}

		if (!this.#provider) {
			const chain =
				this.chains.find((chain) => chain.id === this.#manager.chainId) ||
				this.chains[0]

			this.#provider = new JsonRpcProvider(chain.rpcUrls.default.http[0], {
				name: chain.network,
				chainId: chain.id,
			})
		}
		return this.#provider
	}

	async getSigner() {
		const wallet = await this.options.getSigner()
		return wallet.connect(await this.getProvider())
	}

	async isAuthorized() {
		return true
	}

	async switchChain(chainId: number) {
		const chain = this.chains.find((chain) => chain.id === chainId)
		if (!chain) {
			throw new SwitchChainError(new Error('chain not found on connector.'))
		}
		return chain
	}

	async watchAsset(): Promise<boolean> {
		throw new Error('function not implemented')
	}

	protected onAccountsChanged = (accounts: string[]) => {
		this.emit('change', { account: getAddress(accounts[0]) })
	}

	protected onChainChanged = (chainId: number | string) => {
		const id = normalizeChainId(chainId)
		const unsupported = this.isChainUnsupported(id)
		this.emit('change', { chain: { id, unsupported } })
	}

	protected onDisconnect = () => {
		this.emit('disconnect')
	}

	#returnOrThrow<T>(value: T): NonNullable<T> {
		if (value) {
			return value as NonNullable<T>
		}

		throw new ConnectorNotFoundError()
	}
}
