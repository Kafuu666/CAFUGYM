import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Saat `npm run dev`, request ke /api diteruskan ke backend (http://localhost:5000) sehingga tidak ada masalah CORS.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, proxy: { '/api': 'http://localhost:5000' } },
});
