# Murals Page Redesign — Design

**Date:** 2026-04-19
**Status:** Approved, ready for implementation planning
**Scope:** `src/pages/murals.astro` only (plus new presentational components)

---

## Goals & Audience

**Dual audience, both weighted equally:**

1. **Prospective school clients** (principals, PTOs) — need to leave convinced enough to click "Contact Anna". The page must present the service offering clearly and surface social proof (pull-quote testimonials, past schools served, scope of deliverables).
2. **Portfolio viewers** (press, designers, curious visitors) — need to leave impressed by the body of work. The page must present the art itself at a gallery-grade scale.

## Problems With the Current Page

- Single narrow column (`max-w-4xl`) end-to-end — out of character with the rest of the site, which uses `max-w-7xl` on portfolio pages.
- Text + thumbnails are stacked with no visual connection; no hierarchy within a project.
- The DIA bilingual poems occupy a disproportionate amount of vertical space and break the rhythm of the other three case studies.
- No hero image — page starts with raw text, unlike `index.astro` and `restaurants.astro`.
- Four case studies look identical visually, so "Dual Immersion", "Wingate", "Rocky Mountain", and "Mesa View" blur together.
- Rocky Mountain Interior section has zero thumbnails (orphan visual).
- Service scope-of-work (the "Every school mural includes" checklist) is buried as a flat bulleted list.

## Decisions Locked

| # | Question | Chosen direction |
|---|---|---|
| 1 | Audience priority | Both gallery viewers + prospective clients, equal weight |
| 2 | Hero treatment | Full-bleed cinematic hero image with overlaid text |
| 3 | Case-study layout | Consistent 12-column editorial template (lead image + metadata sidebar + thumb strip) |
| 4 | Bilingual poems | Side-by-side columns on desktop (EN / ES), stacked on mobile |
| 5 | Scope-of-work list | Feature band below hero: 3×2 grid of icon + label + blurb cells |

---

## Page Architecture

Top-to-bottom flow:

1. **Hero** (full-bleed, ~80vh desktop / ~55vh mobile) — image + eyebrow + H1 + subhead + CTA.
2. **Feature band** — "Every School Mural Includes", 3-col grid on desktop, accent-soft background.
3. **Intro paragraph** — existing 1-paragraph pitch, `max-w-3xl` centered.
4. **Case Study 1 — Dual Immersion Academy** (editorial template + bilingual poems block).
5. **Case Study 2 — Wingate Elementary** (editorial template + extended credits prose).
6. **Case Study 3 — Rocky Mountain Elementary** (editorial template; merges the current separate Exterior + Interior sections into one project).
7. **Case Study 4 — Mesa View Elementary** (editorial template).
8. **Final CTA** — "Ready for a custom mural for your school?" + button to `/contact`.

Container width expands from `max-w-4xl` → `max-w-7xl` for all non-hero sections.

---

## Component Breakdown

### New components

- **`src/components/MuralHero.astro`** — full-bleed hero. Props: `eyebrow`, `title`, `subhead`, `ctaHref`, `ctaLabel`, `image`, `imageAlt`. Uses `fetchpriority="high"` + eager loading on the hero image (this becomes the LCP element and also addresses the LCP-lazy-load item in `opti-suggestions.md`).
- **`src/components/FeatureBand.astro`** — scope-of-work 3×2 grid. Takes an array of `{ icon, label, blurb }`. Inline thin-stroke SVG icons consistent with `restaurants.astro` step icons.
- **`src/components/CaseStudy.astro`** — the editorial template. Props:
  - `eyebrow` (location string)
  - `title` (school name)
  - `heroImage`, `heroAlt`
  - `summary` (lede, 2–3 sentences)
  - `pullQuote?` (`{ body, attribution, role }`)
  - `facts?` (array of `{ label, value }`)
  - `thumbs` (array of `{ src, alt }`)
  - `extendedProse?` (slotted long-form content)
  - default `<slot />` for additional blocks like the poems
- **`src/components/PoemsBlock.astro`** — side-by-side bilingual poems. Props: `leadSentence`, `poems: [{ langCode, langLabel, title, body }]`. Uses `<article lang="…">` wrappers for a11y.

### Unchanged

- `src/components/LightboxThumb.astro` — reused for all thumb strips.
- `src/components/ArtImage.astro` — not used on this page anymore; kept as-is for other pages.
- `src/layouts/Layout.astro` — untouched.
- `src/styles/global.css` — untouched. All styling via existing Tailwind theme tokens.

---

## Case-Study Template (Detailed)

Desktop grid:

```
lg:grid-cols-12, gap-10 lg:gap-14
├── hero image            col-span-7  (aspect-[4/5], shadow-xl, rounded-lg, explicit width/height)
└── metadata sidebar      col-span-5  (lg:sticky lg:top-28 lg:self-start)
    ├── eyebrow (location, uppercase + accent color, tracking-wide)
    ├── H2 school name (font-display, 3xl–5xl)
    ├── summary paragraph
    ├── dividing rule (border-t border-black/10)
    ├── optional pull-quote (italic, border-l-2 border-accent, pl-6)
    ├── optional facts table (tabular rows: label | value)
    └── (sticky container ends)

Full-width below the split:
├── thumb strip (grid-cols-2 sm:3 md:4 lg:6, gap-2)
├── optional extended prose (max-w-3xl mx-auto)
└── optional poems block (PoemsBlock component, DIA only)
```

Mobile collapse (`< lg`): all cells become a single vertical column in this order — hero image, metadata, thumbs, extended prose, poems. Sticky is disabled.

### Per-project content

| Project | Hero image | Thumbnails remaining | Extended prose | Pull-quote | Poems |
|---|---|---|---|---|---|
| Dual Immersion Academy | `Dual-Immersion-Academy-School-Mural-8.jpg` | 5 of the existing 6 | — | McLaughlin testimonial | **Yes — bilingual block** |
| Wingate Elementary | `Handprints-1.jpg` | 4 remaining + `DosRiosElementary.webp` | Handprints + monarch origin paragraph + credits paragraph | — | — |
| Rocky Mountain Elementary | `Full-View-RM-Mural-from-Left.jpg` | 2 exterior + any interior thumbs if sourced | Exterior eagle symbolism paragraph + interior 80-foot ribbon paragraph, combined | — | — |
| Mesa View Elementary | `MV-Mural-Main-Pic.jpg` | 3 remaining | Bee/hawk origin paragraph | — | — |

**Rocky Mountain Interior thumbnail gap**: default behaviour is prose-only for the interior story (integrated into the same case study). If interior photos exist in `public/images/` or are later sourced, they get appended to the thumb strip without structural change.

---

## Hero (Detailed)

- Full-bleed section, `min-h-[55vh] md:min-h-[65vh] lg:min-h-[80vh]`, relative.
- `<img>` absolute, inset-0, `object-cover object-[center_30%]`, explicit `width`/`height`, `fetchpriority="high"`, `loading="eager"`.
- Gradient scrim: `absolute inset-0 bg-gradient-to-t from-black/65 via-black/25 to-black/10`.
- Content container: `absolute inset-0 flex items-end lg:items-center`, inner `max-w-7xl mx-auto px-6 lg:px-10 pb-16 lg:pb-0`.
- Eyebrow: `text-xs uppercase tracking-[0.3em] text-white/80`.
- H1: `font-display text-4xl md:text-5xl lg:text-7xl leading-[1.05] text-white max-w-3xl`.
  - Copy: "These hallways tell *our stories*." (the `*…*` renders as `<em class="italic text-[color:var(--color-accent-soft)]">`).
- Subhead: `mt-6 max-w-xl text-lg lg:text-xl text-white/85 leading-relaxed`.
- CTA: `mt-10 inline-flex items-center gap-2 bg-white text-[color:var(--color-ink)] px-8 py-4 text-sm tracking-wide hover:bg-[color:var(--color-accent-soft)] transition-colors` → `/contact`.

Default hero image: `Dual-Immersion-Academy-School-Mural-8.jpg` (swappable via prop).

---

## Feature Band (Detailed)

- Section: `bg-[color:var(--color-accent-soft)]/40 border-y border-black/5 py-20`.
- Inner: `max-w-7xl mx-auto px-6 lg:px-10`.
- Heading block (centered): eyebrow `WHAT'S INCLUDED` + H2 `Every School Mural Includes`.
- Grid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-12`.
- Each cell:
  - Inline SVG icon (~28px, thin stroke, `text-[color:var(--color-accent)]`).
  - Label: `mt-4 font-display text-xl` (bold-toned via font weight, not actual bold).
  - Blurb: `mt-2 text-sm text-black/70 leading-relaxed`.
- No borders on cells; tinted band acts as the enclosure.

Content mapping:

| Icon | Label | Blurb |
|---|---|---|
| chat-bubble | Collaborative Design | Tailored to your school's values and culture |
| monitor | True-to-Scale Mockup | A full-color mockup superimposed onto your actual space |
| pennant / flag | Meaningful Imagery | Your mascot, community, and student experience |
| shield-check | Safe Installation | Professional install with minimal disruption |
| feather | Custom Poem | An original poem to complement the mural |
| sparkles | Protective Finish | Clear finish for lasting vibrancy and durability |

---

## Poems Block (Detailed)

- Section: `max-w-6xl mx-auto px-6 lg:px-10 py-16 lg:py-20 border-y border-black/10`.
- Eyebrow + lead sentence centered above the grid.
- Grid: `grid-cols-1 md:grid-cols-2 gap-8 md:gap-12`.
- Each poem is an `<article lang="…">` with:
  - Language pill: `inline-flex text-[10px] uppercase tracking-[0.2em] bg-[color:var(--color-accent)]/10 text-[color:var(--color-accent)] px-2 py-1 rounded`.
  - Title: `mt-3 font-display text-2xl`.
  - Body: `mt-4 font-display text-lg italic leading-relaxed whitespace-pre-line text-black/80`.
- Each poem wrapped in a subtle card: `bg-[color:var(--color-accent-soft)]/20 border border-black/5 rounded-lg p-8`.

Language metadata: `en` for "Beneath the Sun", `es` for "Bajo el Sol". Both poem bodies copied verbatim from the current file — no wording changes.

---

## Responsive Matrix

| Breakpoint | Hero | Feature band | Case study | Poems | Thumb strip |
|---|---|---|---|---|---|
| `< md` (<768px) | min-h-[55vh], H1 4xl, content bottom-anchored | 1-col | Single column stack | 1-col stacked EN/ES | 2 cols |
| `md` 768–1024 | min-h-[65vh], H1 5xl | 2-col | Single column (tighter spacing) | 2-col parallel | 3–4 cols |
| `lg` 1024+ | min-h-[80vh], H1 7xl, vertically centered | 3-col | 12-col editorial split, sticky sidebar | 2-col with generous gap | 6 cols |
| `xl` 1280+ | same | same | slightly wider gap (`lg:gap-16`) | same | 6 cols |

### Accessibility

- All interactive targets ≥ 44×44px.
- Hero `<img>` has descriptive `alt`; overlaid text is real DOM text, not baked into the image.
- Each `<article lang="en">` / `<article lang="es">` wrapper on the poems so screen readers pronounce correctly.
- Focus rings preserved on all `LightboxThumb` buttons and the hero CTA.
- Contrast verified: hero gradient reaches 65% black at top edge behind the text, which passes AA for white body + headings.
- `prefers-reduced-motion` respected (no new animations introduced).

---

## SEO Side-Effects

This redesign indirectly resolves three items from `opti-suggestions.md`:

- **LCP lazy-load bug** — new hero image is eagerly loaded with `fetchpriority="high"`.
- **Heading hierarchy** — consistent H1 → H2 per case study → H3 for poem titles.
- **Duplicate thumbnail alt text** — `CaseStudy.astro`'s `thumbs` prop takes `{ src, alt }` per thumb, forcing unique alts during implementation.

Further SEO work (JSON-LD, meta descriptions, `<meta name="author">`, etc.) stays in `opti-suggestions.md` and is not part of this redesign.

---

## Explicitly Out of Scope

- Sourcing or renaming image files.
- Adding JSON-LD, structured data, or meta tag improvements (tracked separately).
- Touching the header, footer, or site-wide layout.
- Changing any other page's layout.
- Adding new Tailwind theme tokens or global CSS.
- Adding new npm dependencies.

---

## File Impact Summary

**Edit**
- `src/pages/murals.astro` — full rewrite using the new components.

**Create**
- `src/components/MuralHero.astro`
- ~~`src/components/FeatureBand.astro`~~ — created during build, removed 2026-04-19 before shipping. Replaced with an inline "Artist statement + 3-step process" section in `murals.astro` per user feedback that the feature grid read as sales-y. No component file remains.
- `src/components/CaseStudy.astro`
- `src/components/PoemsBlock.astro`

**No change**
- `src/components/LightboxThumb.astro`, `src/components/ArtImage.astro`, `src/components/Header.astro`, `src/components/Footer.astro`, `src/components/LightboxRoot.astro`
- `src/layouts/Layout.astro`
- `src/styles/global.css`
- `astro.config.mjs`
- `package.json`

No new dependencies.
