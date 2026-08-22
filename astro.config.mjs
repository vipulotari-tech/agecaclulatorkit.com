// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';

const today = new Date().toISOString().split('T')[0];

const pagePriority = {
  '/': 1.0,
  '/birthday-calculator/': 0.9,
  '/date-difference/': 0.9,
  '/how-it-works/': 0.8,
  '/faq/': 0.7,
  '/about/': 0.6,
  '/contact/': 0.5,
  '/privacy-policy/': 0.3,
  '/terms/': 0.3,
  '/disclaimer/': 0.3,
};

const pageChangefreq = {
  '/': 'weekly',
  '/birthday-calculator/': 'monthly',
  '/date-difference/': 'monthly',
  '/how-it-works/': 'monthly',
  '/faq/': 'monthly',
  '/about/': 'yearly',
  '/contact/': 'yearly',
  '/privacy-policy/': 'yearly',
  '/terms/': 'yearly',
  '/disclaimer/': 'yearly',
};

function getPriority(pathname) {
  for (const [pattern, priority] of Object.entries(pagePriority)) {
    if (pathname === pattern) return priority;
  }
  return 0.5;
}

function getChangefreq(pathname) {
  for (const [pattern, freq] of Object.entries(pageChangefreq)) {
    if (pathname === pattern) return freq;
  }
  return 'monthly';
}

// https://astro.build/config
export default defineConfig({
  site: 'https://agecalculatorkit.com',
  output: 'static',

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [sitemap({
    filter: (page) => !page.includes('/404') && !page.includes('/500'),
    serialize(item) {
      const pathname = new URL(item.url).pathname;
      item.lastmod = today;
      item.changefreq = getChangefreq(pathname);
      item.priority = getPriority(pathname);
      return item;
    },
  })],

  adapter: cloudflare(),
});