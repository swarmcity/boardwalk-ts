import { Status } from '../pages/marketplaces/services/marketplace-items'

export type Profile = {
	username: string
	address: string
	encryptedWallet: string
	avatar?: string
	lastUpdate: Date
	lastSync?: Date
	chatBaseKey: Uint8Array
}

export function getStatus(
	status: Status
):
	| 'none'
	| 'open'
	| 'funded'
	| 'complete'
	| 'disputed'
	| 'resolved'
	| 'cancelled' {
	switch (status) {
		case Status.None:
			return 'none'
		case Status.Open:
			return 'open'
		case Status.Funded:
			return 'funded'
		case Status.Done:
			return 'complete'
		case Status.Disputed:
			return 'disputed'
		case Status.Resolved:
			return 'resolved'
		case Status.Cancelled:
			return 'cancelled'
	}
}
