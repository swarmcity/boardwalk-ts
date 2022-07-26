import { defineConfig } from 'vite'
import svgLoader from 'vite-plugin-react-svg'
import preact from '@preact/preset-vite'

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [preact(), svgLoader()],
	css: {
		modules: {
			localsConvention: 'camelCaseOnly',
		},
	},
})
