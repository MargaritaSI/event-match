import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Relative base so the build works on GitHub Pages under any /repo-name/ path.
  base: './',
  plugins: [react()],
  server: { port: 5174 },
})
