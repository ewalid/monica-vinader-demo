import tailwindcss from '@tailwindcss/vite';

export default defineNuxtConfig({
  compatibilityDate: '2026-08-07',

  modules: [
    [
      '@storyblok/nuxt',
      {
        usePlugin: false,
      },
    ],
  ],

  vite: {
    plugins: [tailwindcss()],
  },

  ssr: false,

  css: ['~/assets/css/tailwind.css', '@/assets/css/fonts.css'],

  imports: {
    dirs: ['composables/ecommerce'],
  },

  app: {
    head: {
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=Libre+Caslon+Text:wght@400;700&family=Work+Sans:wght@300;400;500;600&display=swap' },
      ],
    },
  },

  runtimeConfig: {
    public: {
      templateToken: process.env.STORYBLOK_PREVIEW_TOKEN,
      customParent: process.env.STORYBLOK_CUSTOM_PARENT,
      shopifyDomain: process.env.SHOPIFY_STORE_DOMAIN,
      shopifyToken: process.env.SHOPIFY_STOREFRONT_TOKEN,
    },
  },

  devServer: {
    ...(process.env.HTTPS === 'true' && {
      https: {
        key: new URL('./localhost-key.pem', import.meta.url).pathname,
        cert: new URL('./localhost.pem', import.meta.url).pathname,
      },
    }),
  },

  devtools: { enabled: process.env.NUXT_DEVTOOLS_ENABLED === 'true' },
});
