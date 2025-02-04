import { defineConfig } from 'vite'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  root: 'src/renderer',
  base: './',
  plugins: [
    react(),
    electron([
      {
        // Main-Process entry file of the Electron App.
        entry: path.resolve(__dirname, 'electron/main.ts'),
        vite: {
          build: {
            outDir: '../../dist-electron',
            rollupOptions: {
              external: ['electron'],
              output: {
                format: 'cjs'
              }
            }
          }
        }
      },
      {
        entry: path.resolve(__dirname, 'electron/preload.ts'),
        onstart(options) {
          options.reload()
        },
        vite: {
          build: {
            outDir: '../../dist-electron',
            rollupOptions: {
              external: ['electron'],
              output: {
                format: 'cjs'
              }
            }
          }
        }
      },
    ]),
    renderer(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src/renderer/src'),
      '@/components': path.resolve(__dirname, 'src/renderer/src/components'),
      '@/ui': path.resolve(__dirname, 'src/renderer/src/components/ui')
    },
  },
  build: {
    outDir: '../../dist',
    emptyOutDir: true,
  }
})
