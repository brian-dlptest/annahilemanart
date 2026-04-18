# Anna Hileman Art — Modern Prototype

Astro + Tailwind prototype in a modern portfolio style: typography-forward, generous whitespace, soft neutral palette with a warm accent.

## Quick start

```bash
cd annahileman-prototype-modern
npm install
npm run dev
```

Then open http://localhost:4321 in your browser.

## Adding real images

1. Run the download script at `../download-annahileman-images.sh` from a folder on your computer to produce a `wp-uploads/` directory of all artwork from the current WP site.
2. Copy every image file (flattened, not keeping the YYYY/MM folders) into `public/images/` in this project.
3. The pages already reference images by filename (for example `Johannas-Garden-Gem-Full-Edited.jpg`) so they'll render automatically once the files are in place.

## Pages

- `/` — Home
- `/about` — About Anna
- `/portraits` — Pet & Animal Portraits
- `/order-pet-portrait` — Commission form
- `/murals` — Murals overview
- `/school-murals` — School mural service
- `/garden-gems` — Garden Gems series
- `/restaurants` — Restaurant art
- `/custom-artwork` — Commercial work
- `/news` — News & Updates
- `/contact` — Contact form + FAQs

## Contact form

The forms point at `https://formspree.io/f/YOUR_FORM_ID` as a placeholder. Sign up at formspree.io (free tier: 50 submissions/month) and replace `YOUR_FORM_ID` in `src/pages/contact.astro` and `src/pages/order-pet-portrait.astro`.

Alternatives if you outgrow Formspree: Cloudflare Pages Functions (free, custom email handling), Basin, or Getform.
