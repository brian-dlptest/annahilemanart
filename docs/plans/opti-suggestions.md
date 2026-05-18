# Optimization Suggestions — annahileman.com

Running list of SEO, performance, and code-quality improvements identified for the Anna Hileman Art site.

**Legend**
- [ ] = not started
- [~] = in progress
- [x] = done

---

## Critical (fix first)

- [ ] **Add `public/robots.txt`** — advertise sitemap to crawlers.
  ```
  User-agent: *
  Allow: /
  Sitemap: https://annahileman.com/sitemap-index.xml
  ```

- [ ] **Add Schema.org / JSON-LD structured data** (biggest rich-result upside)
  - `Person` + `LocalBusiness` / `ProfessionalService` on home + about (name, email, Colorado city, `sameAs` Instagram/Facebook, `areaServed`, `knowsAbout`).
  - `VisualArtwork` on gallery pages (murals, garden-gems, portraits, restaurants).
  - `Service` / `Offer` with pricing for pet portraits (sizes/prices from `src/pages/portraits.astro:44-59`).
  - `FAQPage` for contact page (`src/pages/contact.astro:14-25`).
  - `NewsArticle` for news entries.
  - `BreadcrumbList` on all inner pages.

- [ ] **Fix broken order form** — `src/pages/order-pet-portrait.astro:13` still uses `https://formspree.io/f/YOUR_FORM_ID`. Wire it to `PUBLIC_FORMSPREE_FORM_ID` like contact.astro does.

- [ ] **Add default `og:image`** (1200×630) + make overrideable per page; upgrade `twitter:card` from `summary` → `summary_large_image` in `src/layouts/Layout.astro:32`.

---

## High Priority

- [ ] **Per-page meta descriptions** — only `contact.astro` passes a `description`. Write unique 140–160 char descriptions for: `index`, `about`, `murals`, `portraits`, `garden-gems`, `restaurants`, `custom-artwork`, `news`, `order-pet-portrait`.

- [~] **Optimize page titles for local/service intent**
  - [x] `murals.astro`: "School Murals | …" → **"Custom School Murals in Colorado | Anna Hileman Art"**
  - [ ] `restaurants.astro`: **"Restaurant Murals & Artwork — Breckenridge & Denver | Anna Hileman Art"**
  - [ ] `portraits.astro`: **"Custom Pet Portrait Paintings — Acrylic & Oil | Anna Hileman Art"**
  - [ ] `garden-gems.astro`: **"Garden Gems — Original Botanical Paintings | Anna Hileman Art"**

- [ ] **Image optimization** — 278 `.jpg` + 37 `.jpeg` + 15 `.png`, only 1 `.webp` (~55 MB total).
  - Migrate to Astro's `<Image />` / `<Picture />` from `astro:assets` (move sources to `src/assets/`) for automatic WebP/AVIF + responsive `srcset` + dimensions.
  - Or batch-convert to WebP and add explicit `width`/`height` attributes to kill CLS.

- [~] **Fix LCP hero lazy-load** — `src/pages/index.astro:33` uses `ArtImage` which hardcodes `loading="lazy"` in `src/components/ArtImage.astro:41`. Hero LCP image should be `loading="eager"` + `fetchpriority="high"` + `<link rel="preload" as="image">`. Add a `priority` prop to `ArtImage`. *(2026-04-19: fixed on `murals.astro` via new `MuralHero.astro` component; `index.astro` still pending.)*

- [ ] **Fix duplicate / non-descriptive alt text**
  - `src/pages/restaurants.astro:181` — 20 Radicato thumbs all share `"Radicato commissioned artwork"`.
  - `src/pages/restaurants.astro:146` — 7 Threefold thumbs identical.
  - `src/pages/portraits.astro:28` — every pet portrait is just `"Pet portrait"`.
  - `src/pages/murals.astro:63, 135, 161, 205` — all thumbs in each section share one alt.
  - Convert arrays to objects (see `src/pages/garden-gems.astro:5-15` pattern) and write unique descriptions.

- [ ] **Rename cryptic image filenames** — `IMG_9457.jpg`, `IMG_6522.jpeg`, `2016-11-16-00.06.01.jpg` → descriptive slugs (`radicato-breckenridge-crane-mural.jpg`). Filenames are a Google Images ranking signal.

---

## Medium Priority

- [ ] **Orphaned `/custom-artwork` page** — listed in README but not linked from `src/components/Header.astro:2-11`. Link from footer/home or delete.

- [ ] **Home heading hierarchy** — `src/pages/index.astro` "Bodies of Work" cards use `<h3>` for the most important internal links. Promote to `<h2>` or wrap each in a `<section>`.

- [ ] **Add semantic meta tags to `src/layouts/Layout.astro`**
  - `<meta name="author" content="Anna Hileman">`
  - `<meta name="theme-color" content="#…">`
  - `<meta property="og:locale" content="en_US">`
  - `<meta property="og:url" content={canonicalUrl}>`
  - `<meta name="robots" content="index, follow, max-image-preview:large">` (crucial for Google Images).

- [ ] **Self-host fonts** — `src/layouts/Layout.astro:36-38` pulls Fraunces + Inter from Google Fonts (render-blocking). Use `@fontsource/fraunces` + `@fontsource/inter`, or preload the single woff2 subset used above the fold.

- [ ] **Add section anchor IDs** — `src/pages/restaurants.astro` and `src/pages/murals.astro` sections have no `id`. Add `id="threefold"`, `id="radicato"`, `id="quality-italian"`, `id="dual-immersion"`, etc. for deep-linking.

- [ ] **Improve internal linking**
  - Restaurant → Garden Gems (Radicato prose mentions Garden Gems — link it).
  - News entries → relevant portfolio pages (Threefold → `/restaurants#threefold`).

---

## Lower-Priority Polish

- [ ] **Audit legacy 301 redirects** — `public/_redirects` only covers `/school-murals`. Pull top pages from old WP site via Search Console and preserve link equity.

- [ ] **News page thin content** — only 2 entries. Publish more or `noindex` to avoid low-quality-page signals.

- [ ] **Footer NAP consistency** — `src/components/Footer.astro` is missing city/region. Add address matching the LocalBusiness schema.

- [ ] **Install analytics** — GA4 or Plausible; needed to measure ranking impact.

- [ ] **Sitemap customization** — configure `changefreq` / `priority` and exclude `/order-pet-portrait` (conversion-only) in `astro.config.mjs:26`.

- [ ] **Confirm `.node-version`** matches `engines.node: ">=20"` in package.json.

---

## Recommended Order of Attack

1. robots.txt + fix order form + og:image (30 min, quick wins)
2. JSON-LD structured data on Layout + gallery pages (2–3 hrs, highest rich-result upside)
3. Per-page titles + meta descriptions (1 hr, immediate SERP impact)
4. Image optimization (move to `astro:assets`, fix LCP lazy-load, unique alt text) (half-day, Core Web Vitals + Google Images)
5. Heading hierarchy, anchor IDs, internal linking (1 hr)
6. Self-host fonts + analytics (30 min)

---

## Notes / New Findings

- **2026-04-19**: Murals page redesigned per `docs/plans/2026-04-19-murals-page-redesign-design.md`. New components: `MuralHero.astro`, `CaseStudy.astro`, `PoemsBlock.astro`. Unique thumbnail alt text now enforced by `CaseStudy.astro`'s `Thumb` type. The `FeatureBand.astro` component in the original plan was replaced mid-build with an inline "Artist statement + 3-step process" section (warmer voice, less feature-matrix sales tone) and then deleted. Other SEO items remain open.
