import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/v1': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      }
    }
  },
  preview: {
    port: 4173,
    host: '0.0.0.0',
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('recharts') || id.includes('d3-')) return 'charts';
          if (id.includes('@tanstack')) return 'query';
          if (id.includes('react-dom') || id.includes('react-router')) return 'vendor';
        }
      }
    }
  }
})
