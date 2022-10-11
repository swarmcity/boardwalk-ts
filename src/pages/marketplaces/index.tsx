import { Routes, Route } from 'react-router-dom'

// Components
import { MarketplaceList } from './list'
import { Marketplace } from './marketplace'
import { MarketplaceListItem } from './list-item'
import { MarketplaceItem } from './item'

// Services
import { getColor } from '../../ui/colors'

export const Marketplaces = () => {
	return (
		<div
			style={{
				backgroundColor: getColor('grey1'),
				width: '100vw',
				height: '100vh',
				overflowY: 'scroll',
				overflowX: 'hidden',
			}}
		>
			<Routes>
				<Route element={<MarketplaceList />} path="/" />
				<Route element={<Marketplace />} path="/:id" />
				<Route element={<MarketplaceListItem />} path="/:id/add" />
				<Route element={<MarketplaceItem />} path="/:id/item/:item" />
			</Routes>
		</div>
	)
}
