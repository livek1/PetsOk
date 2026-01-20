import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	assetsInclude: ['**/*.lottie'],
	build: {
		// Увеличиваем лимит, чтобы не пугаться предупреждений
		chunkSizeWarningLimit: 2000,
		// Убираем manualChunks, чтобы Vite сам разобрался с зависимостями
	},
});