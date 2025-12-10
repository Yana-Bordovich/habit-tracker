import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',  // Добавлено для продакшена
  optimizeDeps: {
    include: ['lucide-react', 'lodash']  // Оптимизация для часто используемых библиотек
  }
});