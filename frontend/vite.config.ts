import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// Dev: proxy API + SSE + WebSocket to the Go backend (single-origin in prod,
// so no CORS is ever needed, the Go binary serves the built dist/).
const GO_BACKEND = process.env.BACKEND_URL ?? 'http://localhost:8080'
const GO_WS = GO_BACKEND.replace(/^http/, 'ws')

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': { target: GO_BACKEND, changeOrigin: true },
      '/ws': { target: GO_WS, ws: true, changeOrigin: true },
    },
  },
})
