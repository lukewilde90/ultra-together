import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Set this to your GitHub repo name, e.g. '/ultra-together'
// When deploying to GitHub Pages at https://username.github.io/repo-name/
// If using a custom domain or username.github.io, set to '/'
const BASE_PATH = process.env.VITE_BASE_PATH ?? '/'

export default defineConfig({
  plugins: [react()],
  base: BASE_PATH,
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
