import { defineConfig } from 'vite'
import svgLoader from 'vite-plugin-react-svg'
import react from '@vitejs/plugin-react'
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react(), svgLoader()],
	css: {
		modules: {
			localsConvention: 'camelCaseOnly',
		},
	},
	build: {
		target: ['es2020'],
		ssr: false,
	},
	resolve: {
		conditions: ['browser', 'module'],
		alias: {
			os: 'rollup-plugin-node-polyfills/polyfills/os',
			'nat-api': 'rollup-plugin-node-polyfills/polyfills/empty',
		},
	},
	optimizeDeps: {
		esbuildOptions: {
			define: {
				global: 'globalThis',
			},
			plugins: [
				NodeGlobalsPolyfillPlugin({
					buffer: true,
				}),
			],
			supported: {
				bigint: true,
			},
		},
	},
})
