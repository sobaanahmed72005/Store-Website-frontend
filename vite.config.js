import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    allowedHosts: true,
    proxy: {
      '/robots.txt': { target: 'http://localhost:5000', changeOrigin: false },
      '/sitemap.xml': { target: 'http://localhost:5000', changeOrigin: false },
    },
  },
  // Vitest reads this same config — jsdom is needed since cartStore.js touches
  // localStorage/document/window/navigator.sendBeacon at import time.
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.js'],
  },
})
