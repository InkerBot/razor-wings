import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import pageCssPlugin from './vite-plugin-page-css'

// https://vite.dev/config/
export default defineConfig({
  plugins: [pageCssPlugin(), react()],
  base: './',
  server: {
    cors: true,
  },
  preview: {
    cors: true,
  },
  build: {
    rollupOptions: {
      input: 'src/main.tsx',
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]'
      },
    },
  },
})
