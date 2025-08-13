import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Enhanced browser compatibility
  build: {
    target: ['es2020', 'edge88', 'firefox85', 'chrome88', 'safari14'],
    cssTarget: 'chrome88',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor chunks
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['framer-motion', 'react-hot-toast', '@heroicons/react'],
          'vendor-data': ['@tanstack/react-query', 'zustand'],
          'vendor-canvas': ['konva', 'react-konva'],
        },
      },
    },
    // Increase chunk size limit to reduce warnings
    chunkSizeWarningLimit: 1000,
  },
  // Enable compression in development for better testing
  server: {
    compress: true,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom', 
      'react-router-dom',
      'framer-motion',
      '@tanstack/react-query',
      'zustand',
      'konva',
      'react-konva'
    ],
  },
})
