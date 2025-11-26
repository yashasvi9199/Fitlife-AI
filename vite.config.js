import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Use root path for Capacitor/Android builds, GitHub Pages path for web
  // eslint-disable-next-line no-undef
  const isCapacitor = process.env.CAPACITOR === 'true';
  const base = isCapacitor ? '/' : (mode === 'production' ? '/Fitlife-AI/' : '/');

  console.log(`[Vite Config] Mode: ${mode}, Is Capacitor: ${isCapacitor}, Base: ${base}`);

  return {
    plugins: [react()],
    base: base,
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      emptyOutDir: true,
    },
  };
})
