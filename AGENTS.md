# Anna Hileman Art — agent context

Lean notes for Cursor agents (Cursor 3+). Prefer discovering details by reading `src/` over duplicating them here.

## Commands

- Install: `npm install`
- Dev server: `npm run dev` — port is set in `astro.config.mjs` (`server.port`, currently **4322**)
- Production build: `npm run build` → output `dist/`
- Preview build: `npm run preview`

Requires **Node ≥ 20** (`package.json` `engines`).

## Stack

- **Astro 5** with **Tailwind CSS 4** (`@tailwindcss/vite` in `astro.config.mjs`)
- Pages: `src/pages/*.astro`
- Shared chrome: `src/layouts/Layout.astro`, `src/components/Header.astro`, `src/components/Footer.astro`
- Global styles: `src/styles/global.css`

## Env / deployment

- **Site URL**: `PUBLIC_SITE_URL` for canonical URLs and sitemap; see comments in `astro.config.mjs`.
- **Cloudflare Pages**: build `npm run build`, output `dist`. See `DEPLOY.txt` for project names and DNS notes.
- **Contact / order forms**: replace Formspree placeholder IDs; production uses `PUBLIC_FORMSPREE_FORM_ID` on Cloudflare (see `DEPLOY.txt`).

## Assets

- Static files: `public/` (e.g. images under `public/images/`).
