import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	assetsInclude: ['**/*.lottie'],
	build: {
		// Увеличим лимит предупреждения до 1000kb, так как современные приложения тяжелые
		chunkSizeWarningLimit: 1000,
		rollupOptions: {
			output: {
				// Ручная настройка разделения на чанки (файлы)
				manualChunks(id) {
					if (id.includes('node_modules')) {
						// Выделяем React и основные либы в отдельный файл
						if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom') || id.includes('redux')) {
							return 'vendor-react';
						}
						// Выделяем тяжелые карты
						if (id.includes('react-yandex-maps') || id.includes('yandex-maps')) {
							return 'vendor-maps';
						}
						// Выделяем анимации
						if (id.includes('lottie') || id.includes('framer-motion')) {
							return 'vendor-ui';
						}
						// Все остальные библиотеки
						return 'vendor-libs';
					}
				},
			},
		},
	},
});