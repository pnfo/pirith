import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

/**
 * Two targets from one codebase:
 *   web (default)  history routing under /pirith/, every page prerendered by dev/prerender.js -> dist/
 *   app            hash routing with relative paths, for the Android/iOS WebView -> dist-app/
 * PIRITH_BASE overrides the web base path (e.g. "/" to host on its own domain).
 */
const target = process.env.PIRITH_TARGET === 'app' ? 'app' : 'web'

export default defineConfig(({ isSsrBuild }) => ({
  plugins: [vue()],
  resolve: {
    alias: { '@': path.resolve(import.meta.dirname, './src') },
  },
  base: target === 'app' ? './' : (process.env.PIRITH_BASE || '/pirith/'),
  define: {
    __APP__: JSON.stringify(target === 'app'),
  },
  build: {
    outDir: isSsrBuild ? 'dist-ssr' : (target === 'app' ? 'dist-app' : 'dist'),
    copyPublicDir: !isSsrBuild,
    emptyOutDir: true,
  },
}))
