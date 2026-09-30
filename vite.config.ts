import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const configuredBase = env.VITE_BASE_PATH || '/our_hearts/'
  const segments = configuredBase.split('/').filter(Boolean)
  const base = `/${segments.join('/')}${segments.length ? '/' : ''}`

  return {
    base,
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'prompt',
        injectRegister: null,
        scope: base,
        includeAssets: ['icons/*.png', 'icons/*.svg', '.nojekyll'],
        manifest: {
          id: base,
          name: 'our hearts — Aleem & Nurul',
          short_name: 'our hearts',
          description: 'A little closer, one question at a time.',
          start_url: `${base}#/together`,
          scope: base,
          display: 'standalone',
          orientation: 'any',
          background_color: '#F7F4EF',
          theme_color: '#713C4D',
          lang: 'en',
          icons: [
            { src: `${base}icons/icon-192.png`, sizes: '192x192', type: 'image/png', purpose: 'any' },
            { src: `${base}icons/icon-512.png`, sizes: '512x512', type: 'image/png', purpose: 'any' },
            { src: `${base}icons/icon-maskable-512.png`, sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
        },
        workbox: {
          cacheId: 'our_hearts',
          cleanupOutdatedCaches: false,
          globPatterns: ['**/*.{js,css,html,woff2,svg,png,webp,avif,webmanifest}'],
          navigateFallback: `${base}index.html`,
          // Hash navigation only needs this app's document, never sibling apps.
          navigateFallbackAllowlist: [new RegExp(`^${base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:index\\.html)?$`)],
        },
        devOptions: { enabled: false },
      }),
    ],
  }
})
