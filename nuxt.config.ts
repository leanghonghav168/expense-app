export default defineNuxtConfig({
  modules: [
    '@vite-pwa/nuxt',
    '@nuxtjs/tailwindcss'
  ],

  devServer: {
    port: 3010
  },

  devtools: { enabled: true },

  compatibilityDate: '2025-07-15',

  css: ['~/assets/css/main.css'],

  app: {
    head: {
      title: 'My Expense Tracker',
      meta: [
        { charset: 'utf-8' },
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover, user-scalable=no'
        },
        { name: 'description', content: 'Personal income and expense tracker' },
        { name: 'theme-color', content: '#16a34a' },
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'apple-mobile-web-app-title', content: 'Expenses' }
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/icons/icon-192.png' },
        { rel: 'apple-touch-icon', href: '/icons/apple-touch-icon.png' }
      ]
    }
  },

  pwa: {
    registerType: 'autoUpdate',

    manifest: {
      name: 'My Expense Tracker',
      short_name: 'Expenses',
      description: 'Personal income and expense tracker',
      theme_color: '#16a34a',
      background_color: '#ffffff',
      display: 'standalone',
      orientation: 'portrait',
      start_url: '/',
      scope: '/',
      icons: [
        {
          src: '/icons/icon-192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: '/icons/icon-512.png',
          sizes: '512x512',
          type: 'image/png'
        },
        {
          src: '/icons/icon-maskable-512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable'
        }
      ]
    },

    workbox: {
      navigateFallback: '/',
      // Never cache private server API endpoints in service worker
      navigateFallbackDenylist: [/^\/api/],
      globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}']
    },

    client: {
      installPrompt: true
    }
  }
})