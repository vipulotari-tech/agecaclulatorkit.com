# Age Calculator

Production source for [agecalculatorkit.com](https://agecalculatorkit.com), an Astro and Tailwind CSS website deployed on Cloudflare.

## Requirements

- Node.js 22.12 or newer
- npm

## Commands

| Command | Purpose |
| --- | --- |
| `npm ci` | Install the locked dependency versions |
| `npm run dev` | Start the Astro development server |
| `npm run build` | Build the production site into `dist/client` |
| `npm run preview:pages` | Preview the Cloudflare Pages build locally |
| `npm run deploy:pages` | Build and deploy to the production Pages branch |
| `npm run deploy:worker` | Build and deploy the Cloudflare Worker target |

## Structure

```text
public/          Static files, icons, robots.txt, and Cloudflare headers
src/components/ Reusable Astro components and calculators
src/data/       Shared content data
src/layouts/    Site layouts and metadata
src/pages/      Static routes
src/styles/     Global Tailwind theme and CSS
src/utils/      Calendar and date calculation utilities
```

The site is statically generated. Date calculations run in the browser and do not require a backend database.
