import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
	plugins: [react()],
	assetsInclude: ['**/*.lottie'],
	build: {
		target: 'esnext',
		minify: 'esbuild',
		chunkSizeWarningLimit: 1000,

		// ⬇️ ВОТ ГЛАВНОЕ ИСПРАВЛЕНИЕ ⬇️
		modulePreload: {
			polyfill: false,
			// Эта функция говорит Vite: "Не добавляй никакие <link rel='modulepreload'> в HTML"
			// Браузер загрузит файл ТОЛЬКО когда React реально до него дойдет.
			resolveDependencies: () => [],
		},

		rollupOptions: {
			output: {
				manualChunks(id) {
					if (id.includes('node_modules')) {
						// 1. ЯДРО (React + Router)
						if (
							id.includes('/react/') ||
							id.includes('/react-dom/') ||
							id.includes('/react-router/') ||
							id.includes('/scheduler/') ||
							id.includes('/prop-types/')
						) {
							return 'vendor-react-core';
						}

						// 2. LOTTIE (Плеер) - Выносим жестко
						// Ловит @dotlottie/react-player, lottie-web и т.д.
						if (id.includes('lottie') || id.includes('dotlottie')) {
							return 'vendor-lottie-player';
						}

						// 3. КАРТЫ
						if (id.includes('yandex') || id.includes('react-yandex-maps')) {
							return 'vendor-maps';
						}

						// 4. ТЯЖЕЛАЯ ГРАФИКА
						if (id.includes('framer-motion')) {
							return 'vendor-framer';
						}

						// 5. ДАННЫЕ
						if (id.includes('redux') || id.includes('axios')) {
							return 'vendor-data';
						}

						// Остальное
						return 'vendor-libs';
					}
				},
			},
		},
	},
});