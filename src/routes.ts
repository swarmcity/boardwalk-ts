export const LOGIN = '/login'
export const HOME = '/'
export const CREATE_ACCOUNT = '/create-account'

export const ACCOUNT = '/account'
export const ACCOUNT_PASSWORD = '/account-password'
export const ACCOUNT_CREATED = '/account-created'
export const ACCOUNT_BACKUP = '/account-backup'
export const ACCOUNT_RESTORE = '/account-restore'
export const ACCOUNT_WALLET = '/account-wallet'
export const ACCOUNT_WALLET_SEND = '/account-wallet/send'
export const ACCOUNT_PRIVATE_WALLET = '/account-private-wallet'
export const ACCOUNT_PUBLIC_WALLET = '/account-public-wallet'

export const MARKETPLACES = '/marketplace'
export const MARKETPLACE = (id: string) => `/marketplace/${id}`
export const MARKETPLACE_ADD = (id: string) => `/marketplace/${id}/add`
export const MARKETPLACE_ITEM = (id: string, item: number | string) =>
	`/marketplace/${id}/item/${item}`

export const USER = (id: string) => `/user/${id}`
