export type UpdateTime = {
	blockNumber: number
	transactionIndex: number
}

export const shouldUpdate = (current: UpdateTime, last?: UpdateTime) => {
	if (!last) {
		return true
	}

	return (
		current.blockNumber > last.blockNumber ||
		(current.blockNumber === last.blockNumber &&
			current.transactionIndex > last.transactionIndex)
	)
}
