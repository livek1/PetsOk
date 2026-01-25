import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
	plugins: [react()],
	assetsInclude: ['**/*.lottie'],
	build: {
		chunkSizeWarningLimit: 1000,
		rollupOptions: {
			output: {
				// Мы используем более стабильную схему именования чанков
				manualChunks(id) {
					if (id.includes('node_modules')) {
						// Выносим только самые тяжелые либы, которые не нужны на главной
						if (id.includes('yandex-maps') || id.includes('react-yandex-maps')) {
							return 'vendor-maps';
						}
						if (id.includes('framer-motion')) {
							return 'vendor-framer';
						}
						if (id.includes('lottie')) {
							return 'vendor-lottie';
						}
						// Все остальное (axios, redux, i18n) пусть живет в общем vendor или main
						// Это гарантирует, что зависимости React загрузятся правильно
						return 'vendor-others';
					}
				},
			},
		},
	},
});