import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
    server: {
    allowedHosts: ["640d-102-90-117-113.ngrok-free.app", "https://640d-102-90-117-113.ngrok-free.app"],
  },
})
