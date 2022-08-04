import { createRoot } from 'react-dom/client'
import { App } from './app'
import './css/style.css'
import './css/custom.css'

// NOTE: Strict mode breaks reach router, so it was removed for now
createRoot(document.getElementById('app') as HTMLElement).render(<App />)
