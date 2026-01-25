import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
	plugins: [
		react(),
	],
	assetsInclude: ['**/*.lottie'],
	build: {
		target: 'esnext',
		minify: 'esbuild',
		chunkSizeWarningLimit: 1000,

		// 🔴 КРИТИЧНО ВАЖНО: Отключаем предзагрузку, 
		// чтобы тяжелые файлы не качались на главной сами по себе
		modulePreload: {
			polyfill: false,
		},

		rollupOptions: {
			output: {
				manualChunks(id) {
					if (id.includes('node_modules')) {

						// 1. Ядро React (грузим сразу)
						if (
							id.includes('/react/') ||
							id.includes('/react-dom/') ||
							id.includes('/react-router/') ||
							id.includes('/scheduler/') ||
							id.includes('/prop-types/')
						) {
							return 'vendor-react-core';
						}

						// 2. Lottie (грузим ТОЛЬКО когда нужно)
						// Список всех возможных названий пакетов плеера
						if (
							id.includes('@dotlottie') ||
							id.includes('lottie-web') ||
							id.includes('lottie-react')
						) {
							return 'vendor-lottie-player';
						}

						// 3. Карты (грузим отдельно)
						if (
							id.includes('yandex') ||
							id.includes('react-yandex-maps')
						) {
							return 'vendor-maps';
						}

						// 4. Тяжелые UI либы
						if (id.includes('framer-motion')) {
							return 'vendor-framer';
						}

						// 5. Данные
						if (id.includes('redux') || id.includes('axios')) {
							return 'vendor-data';
						}

						// Все остальное
						return 'vendor-libs';
					}
				},
			},
		},
	},
});