import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
<<<<<<< HEAD
=======
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  },
  publicDir: 'public'
>>>>>>> f0a58e6 (Initial commit)
});
