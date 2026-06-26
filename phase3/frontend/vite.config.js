import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/chat': 'http://localhost:8000',
      '/transcribe': 'http://localhost:8000',
      '/speak': 'http://localhost:8000',
    },
  },
})
