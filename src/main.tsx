import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { App } from './app'
import './css/style.css'

// NOTE: Strict mode breaks reach router, so it was removed for now
createRoot(document.getElementById('app') as HTMLElement).render(
	<BrowserRouter>
		<App />
	</BrowserRouter>
)
