import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    allowedHosts: ['5173-ilqznanbr5pxuzj74wkz3-25571dc1.manusvm.computer']
  },
  preview: {
    allowedHosts: ['4173-ilqznanbr5pxuzj74wkz3-25571dc1.manusvm.computer']
  },
  build: {
    // تحسينات الأداء
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // إزالة console.log في الإنتاج
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        // تقسيم الكود لتحسين التحميل
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          charts: ['recharts'],
          utils: ['clsx', 'tailwind-merge']
        }
      }
    },
    // ضغط الأصول
    assetsInlineLimit: 4096,
    // تحسين حجم الحزمة
    chunkSizeWarningLimit: 1000
  },
  // تحسين التطوير
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom']
  }
})
