import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
// GitHub Pages はサブパス（/protoplay-2d/）配信のため base を合わせる。
export default defineConfig({
  base: '/protoplay-2d/',
  plugins: [react()],
});
