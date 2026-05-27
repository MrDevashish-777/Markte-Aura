import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Vite proxy routes:
 *
 *  /api/news  → https://newsapi.org
 *
 * Why: NewsAPI free plan only allows requests from localhost.
 * The browser can't call newsapi.org directly (CORS blocked).
 * Vite dev server proxies the request server-side, so NewsAPI
 * sees it as coming from localhost — which IS allowed on free plan.
 */
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/news': {
        target: 'https://newsapi.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/news/, ''),
        secure: true,
      },
    },
  },
})
