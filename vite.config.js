import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    port: 3000,
    open: true, // Automatically open browser
    host: true // Allow external connections
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true
  },
  // Optimize for your audio visualizer
  optimizeDeps: {
    include: []
  }
})
