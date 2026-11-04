// import react from '@vitejs/plugin-react'
// import { defineConfig } from 'vite'
// import tailwindcss from '@tailwindcss/vite'

// // https://vite.dev/config/
 
// export default defineConfig({
//   plugins: [react(), tailwindcss()],
//   server: { proxy: { '/api': 'http://localhost:5000' } },
// })


import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'ClipiDO',
        short_name: 'ClipiDO',
        description: 'Find the 5 best Shorts moments in any video transcript.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#09090b',
        theme_color: '#09090b',
        icons: [
          { src: './public/192.png', sizes: '192x192', type: 'image/png' },
          { src: './public/512.png', sizes: '512x512', type: 'image/png' },
          { src: './public/192.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        navigateFallbackDenylist: [/^\/api/], // never treat API calls as pages
      },
      devOptions: { enabled: true },
    }),
  ],
  server: { proxy: { '/api': 'http://localhost:5000' } },
})