import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import legacy from '@vitejs/plugin-legacy'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    legacy({
      // Ensure compatibility down to Android 7 (API 24)
      targets: ['defaults', 'not IE 11', 'chrome 51', 'android >= 7']
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // This ensures assets are loaded like "./assets/file.js" 
  // instead of "/assets/file.js" needed for android app
  base: './',
})