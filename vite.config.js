import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
  },
  server: {
    port: 5173,
    open: true,
  },
  build: {
    // Optimisations pour réduire la taille du bundle
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Séparer les grandes bibliothèques
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor'
            }
            if (id.includes('recharts')) {
              return 'charts-vendor'
            }
            if (id.includes('@supabase')) {
              return 'supabase-vendor'
            }
            if (id.includes('lucide-react')) {
              return 'ui-vendor'
            }
            // Autres node_modules
            return 'vendor'
          }
        },
      },
    },
    // Augmenter la limite d'avertissement pour les gros chunks
    chunkSizeWarningLimit: 1000,
    // Utiliser esbuild (plus rapide que terser et inclus avec Vite)
    minify: 'esbuild',
    // Optimiser les assets
    assetsInlineLimit: 4096, // Inline les petits assets (<4kb) en base64
    // Source maps pour le debugging (désactivé en prod pour la performance)
    sourcemap: false,
  },
  // Optimiser les dépendances
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
})

