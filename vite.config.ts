import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	assetsInclude: ['**/*.lottie'],
	build: {
		// Возвращаем стандартный лимит (или чуть выше), так как теперь чанки будут меньше
		chunkSizeWarningLimit: 1000,

		rollupOptions: {
			output: {
				manualChunks(id) {
					// Проверяем, находится ли модуль в node_modules
					if (id.includes('node_modules')) {
						// 1. React и его экосистема - в отдельный чанк
						if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom') || id.includes('redux')) {
							return 'vendor-react-core';
						}
						// 2. Яндекс Карты (тяжелая библиотека)
						if (id.includes('react-yandex-maps') || id.includes('yandex-maps')) {
							return 'vendor-maps';
						}
						// 3. Анимации и UI (Framer Motion, Lottie)
						if (id.includes('framer-motion') || id.includes('lottie') || id.includes('dotlottie')) {
							return 'vendor-ui-libs';
						}
						// 4. Axios и утилиты
						if (id.includes('axios') || id.includes('moment') || id.includes('i18next')) {
							return 'vendor-utils';
						}

						// Все остальные библиотеки пойдут в общий vendor файл
						return 'vendor';
					}
				},
			},
		},
	},
});