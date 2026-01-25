import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
	plugins: [react()],
	assetsInclude: ['**/*.lottie'],
	build: {
		target: 'esnext',
		minify: 'esbuild',
		chunkSizeWarningLimit: 1000,

		// Отключаем предзагрузку, чтобы не качать Lottie сразу
		modulePreload: {
			polyfill: false,
		},

		rollupOptions: {
			output: {
				manualChunks(id) {
					if (id.includes('node_modules')) {

						// 1. ИЗОЛЯЦИЯ LOTTIE (Самое важное для нас)
						if (id.includes('@dotlottie') || id.includes('lottie')) {
							return 'vendor-lottie-player';
						}

						// 2. ИЗОЛЯЦИЯ КАРТ (Yandex Maps)
						if (id.includes('yandex') || id.includes('react-yandex-maps')) {
							return 'vendor-maps';
						}

						// 3. ИЗОЛЯЦИЯ ТЯЖЕЛОЙ ГРАФИКИ
						if (id.includes('framer-motion')) {
							return 'vendor-framer';
						}

						// 4. ВСЁ ОСТАЛЬНОЕ - В ОДИН ФАЙЛ (Чобы не было белого экрана)
						// React, Router, Redux, Axios и прочее будут здесь.
						// Это гарантирует, что приложение запустится.
						return 'vendor-main';
					}
				},
			},
		},
	},
});