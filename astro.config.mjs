// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  site: 'https://agecalculatorkit.com',
  output: 'static',
  trailingSlash: 'always',

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [
    sitemap({
      // Only successful, canonical content pages belong in the sitemap.
      filter: (page) => !page.includes('/404') && !page.includes('/500'),
    }),
  ],

  adapter: cloudflare(),
});
