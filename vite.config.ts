import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    // Optimized chunk size for images and assets
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          // Optimize image file naming for cache busting
          if (assetInfo.name && assetInfo.name.match(/\.(webp|png|jpg|jpeg|svg)$/)) {
            return 'assets/images/[name]-[hash][extname]'
          }
          return 'assets/[name]-[hash][extname]'
        },
      },
    },
  },
})
