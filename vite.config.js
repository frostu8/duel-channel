import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	server: {
		port: 4001,
		proxy: {
			'/api/v1': {
				target: 'http://localhost:4000',
				changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/v1/, ''),
        ws: true,
			},
		},
	},
	plugins: [sveltekit()]
});
