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
})
