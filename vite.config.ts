import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/resolvia-equity/', // ✅ This MUST match your repo name exactly
});
