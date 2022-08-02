import { useState } from 'preact/hooks'

// Types
import type { RouteComponentProps } from '@reach/router'
import type { EventHandler } from '../../types/dom'

type MarketplaceListItemProps = RouteComponentProps

export const MarketplaceListItem = (_: MarketplaceListItemProps) => {
	const [description, setDescription] = useState<string>()
	const [price, setPrice] = useState<number>()

	const onSubmit = (event: EventHandler<HTMLFormElement>) => {
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
