import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	css: {
		modules: {
			localsConvention: 'camelCaseOnly',
		},
	},
	build: {
		target: ['es2020'],
	},
	optimizeDeps: {
		esbuildOptions: {
			supported: {
				bigint: true,
			},
		},
	},
})
