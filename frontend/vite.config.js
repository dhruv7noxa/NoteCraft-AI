import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/NoteCraft-AI/',
  plugins: [react()],
  define: {
    "process.env.IS_PREACT": JSON.stringify("true"),
    "process.env.NODE_ENV": JSON.stringify("development")
  }
})
