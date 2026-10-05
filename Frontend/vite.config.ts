import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react':   ['react', 'react-dom'],
          'vendor-chakra':  ['@chakra-ui/react', '@emotion/react', '@emotion/styled', 'framer-motion'],
          'vendor-misc':    ['sonner', 'socket.io-client'],
        }
      }
    }
  },
  server: {
    port: 5173,
    host: true,
    proxy: {}
  }
})