import { useState } from 'react'

// Types
import type { FormEvent } from 'react'

export const MarketplaceListItem = () => {
	const [description, setDescription] = useState<string>()
	const [price, setPrice] = useState<number>()

	const onSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		console.log({ description, price })
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
				placeholder="What would you like to offer?"
				onChange={(event) => setPrice(Number(event.currentTarget.value))}
			/>{' '}
			+ 0.5 DAI fee
			<button type="submit">Next</button>
		</form>
	)
}
