import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  // Project Pages live under /dear-papa/; local dev stays at the root.
  base: mode === 'production' ? '/dear-papa/' : '/',
  plugins: [react()],
}))
