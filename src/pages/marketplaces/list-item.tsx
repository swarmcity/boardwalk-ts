import { useState } from 'react'
import { useParams } from 'react-router'

// Hooks
import { useWakuContext } from '../../hooks/use-waku'

// Types
import type { FormEvent } from 'react'
import { createItem } from './services/marketplace-items'
import { useAccount } from 'wagmi'

export const MarketplaceListItem = () => {
	const { id } = useParams<string>()
	if (!id) {
		throw new Error('no id')
	}

	const [description, setDescription] = useState<string>()
	const [price, setPrice] = useState<number>()
	const { waku } = useWakuContext()
	const { connector } = useAccount()

	const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()

		if (!waku || !connector) {
			// TODO: Error message
			return
		}

		if (!description || !price) {
			// TODO: Error message
			return
		}

		await createItem(waku, id, { price, description }, connector)
	}

	return (
		<form onSubmit={onSubmit}>
			<input
				type="text"
				placeholder="What are you looking for?"
				onChange={(event) => setDescription(event.currentTarget.value)}
			/>
			<input
				type="number"
				step=".01"
				placeholder="What would you like to offer?"
				onChange={(event) => setPrice(Number(event.currentTarget.value))}
			/>{' '}
			+ 0.5 DAI fee
			<button type="submit">Next</button>
		</form>
	)
}
