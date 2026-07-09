import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react-big-calendar')) return 'vendor-calendar';
          if (id.includes('node_modules/recharts')) return 'vendor-charts';
          if (id.includes('node_modules/lucide-react')) return 'vendor-icons';
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react')) return 'vendor-react';
          if (id.includes('node_modules')) return 'vendor-other';
        },
      },
    },
    chunkSizeWarningLimit: 400,
  },
})
