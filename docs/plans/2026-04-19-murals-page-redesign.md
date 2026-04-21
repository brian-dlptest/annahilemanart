# Murals Page Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the single-column, text-heavy `/murals` page with a full-bleed hero, a feature band, and four case studies built on a reusable 12-column editorial template, with side-by-side bilingual poems on the Dual Immersion Academy section. Fully responsive, no new dependencies.

**Architecture:** Extract four new presentational Astro components (`MuralHero`, `FeatureBand`, `CaseStudy`, `PoemsBlock`) that live under `src/components/`. Rewrite `src/pages/murals.astro` to assemble them with content defined as typed TypeScript data at the top of the page file. Content from the current page is preserved verbatim; only structure and presentation change. All styling uses existing Tailwind v4 theme tokens defined in `src/styles/global.css` — no new global CSS, no new npm packages.

**Tech Stack:** Astro 5.18, Tailwind CSS v4 (`@tailwindcss/vite`), TypeScript, existing `LightboxThumb.astro` component for thumbnail interactions. Node ≥ 20.

**Design reference:** `docs/plans/2026-04-19-murals-page-redesign-design.md` — read this before starting.

**Project state notes:**
- No test framework is installed. "Verify" steps use `npx astro check` + `npm run build` + dev-server HTTP checks.
- No git repo initialized. Commit steps are omitted; an optional Task 0 initializes git so future work can be version-controlled.
- Dev server runs on `http://localhost:4322` (set in `astro.config.mjs`).

---

## Task 0 (Optional): Initialize git

Skip if the user does not want version control yet.

**Files:** none created or modified in source.

**Step 1: Initialize repo**

Run:
```bash
cd /Users/zackhayes/webdev/annahilemanart-main
git init -b main
```
Expected: `Initialized empty Git repository in …/.git/`

**Step 2: Stage current state as baseline commit**

Run:
```bash
git add -A
git commit -m "chore: baseline before murals page redesign"
```
Expected: a commit with all existing files included.

---

## Task 1: Baseline — confirm current build is green

Sanity-check that nothing is broken before we start modifying files.

**Files:** none.

**Step 1: Install deps if missing**

Run: `ls node_modules/.package-lock.json 2>/dev/null && echo OK || npm install`
Expected: `OK` or successful install output.

**Step 2: Run Astro type check**

Run: `npx astro check`
Expected: exit code 0, "0 errors, 0 warnings".

**Step 3: Run production build**

Run: `npm run build`
Expected: `Complete!` with no errors; a `dist/` directory is written containing `murals/index.html`.

**Step 4: Note the current HTML size as a reference point**

Run: `wc -c dist/murals/index.html`
Expected: a byte count recorded mentally (useful later to confirm the page didn't accidentally lose content).

---

## Task 2: Scaffold `MuralHero.astro`

Create the full-bleed hero component with overlaid text.

**Files:**
- Create: `src/components/MuralHero.astro`

**Step 1: Create the file**

Write exactly this content to `src/components/MuralHero.astro`:

```astro
---
interface Props {
  eyebrow: string;
  title: string;
  /** Optional italicized suffix appended to title, rendered in accent color. */
  titleSuffix?: string;
  subhead: string;
  ctaHref: string;
  ctaLabel: string;
  /** Filename under /images/ */
  image: string;
  imageAlt: string;
  /** Intrinsic width of the source image, in px, for CLS prevention. */
  imageWidth: number;
  /** Intrinsic height of the source image, in px. */
  imageHeight: number;
}

const {
  eyebrow,
  title,
  titleSuffix,
  subhead,
  ctaHref,
  ctaLabel,
  image,
  imageAlt,
  imageWidth,
  imageHeight,
} = Astro.props;
---
<section class="relative isolate overflow-hidden min-h-[55vh] md:min-h-[65vh] lg:min-h-[80vh]">
  <img
    src={`/images/${image}`}
    alt={imageAlt}
    width={imageWidth}
    height={imageHeight}
    fetchpriority="high"
    loading="eager"
    decoding="async"
    class="absolute inset-0 h-full w-full object-cover object-[center_30%]"
  />
  <div
    class="absolute inset-0 bg-gradient-to-t from-black/65 via-black/25 to-black/10"
    aria-hidden="true"
  ></div>
  <div class="absolute inset-0 flex items-end lg:items-center">
    <div class="max-w-7xl mx-auto w-full px-6 lg:px-10 pb-16 lg:pb-0">
      <div class="text-xs uppercase tracking-[0.3em] text-white/80 mb-6">
        {eyebrow}
      </div>
      <h1 class="font-display text-4xl md:text-5xl lg:text-7xl leading-[1.05] text-white max-w-3xl">
        {title}
        {titleSuffix && (
          <>
            {' '}
            <em class="italic text-[color:var(--color-accent-soft)]">{titleSuffix}</em>
          </>
        )}
      </h1>
      <p class="mt-6 max-w-xl text-lg lg:text-xl text-white/85 leading-relaxed">
        {subhead}
      </p>
      <a
        href={ctaHref}
        class="mt-10 inline-flex items-center gap-2 bg-white text-[color:var(--color-ink)] px-8 py-4 text-sm tracking-wide hover:bg-[color:var(--color-accent-soft)] transition-colors"
      >
        {ctaLabel}
        <span aria-hidden="true">&rarr;</span>
      </a>
    </div>
  </div>
</section>
```

**Step 2: Type-check**

Run: `npx astro check`
Expected: exit code 0.

---

## Task 3: Scaffold `FeatureBand.astro`

Create the "Every School Mural Includes" 3×2 grid with inline SVG icons.

**Files:**
- Create: `src/components/FeatureBand.astro`

**Step 1: Create the file**

Write exactly this content to `src/components/FeatureBand.astro`:

```astro
---
type IconKey = 'chat' | 'monitor' | 'pennant' | 'shield' | 'feather' | 'sparkles';

interface Feature {
  icon: IconKey;
  label: string;
  blurb: string;
}

interface Props {
  eyebrow: string;
  title: string;
  features: Feature[];
}

const { eyebrow, title, features } = Astro.props;
---
<section class="bg-[color:var(--color-accent-soft)]/40 border-y border-black/5">
  <div class="max-w-7xl mx-auto px-6 lg:px-10 py-20">
    <div class="text-center mb-14">
      <div class="text-xs uppercase tracking-[0.3em] text-[color:var(--color-accent)]">
        {eyebrow}
      </div>
      <h2 class="mt-4 font-display text-3xl md:text-4xl">{title}</h2>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-12">
      {features.map((f) => (
        <div>
          <div class="text-[color:var(--color-accent)]">
            {f.icon === 'chat' && (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337L5.05 21l1.395-3.72C5.512 15.042 5 13.574 5 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
              </svg>
            )}
            {f.icon === 'monitor' && (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
              </svg>
            )}
            {f.icon === 'pennant' && (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" />
              </svg>
            )}
            {f.icon === 'shield' && (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            )}
            {f.icon === 'feather' && (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
            )}
            {f.icon === 'sparkles' && (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.847.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
              </svg>
            )}
          </div>
          <div class="mt-4 font-display text-xl">{f.label}</div>
          <p class="mt-2 text-sm text-black/70 leading-relaxed">{f.blurb}</p>
        </div>
      ))}
    </div>
  </div>
</section>
```

**Step 2: Type-check**

Run: `npx astro check`
Expected: exit code 0.

---

## Task 4: Scaffold `PoemsBlock.astro`

Create the bilingual side-by-side poems component.

**Files:**
- Create: `src/components/PoemsBlock.astro`

**Step 1: Create the file**

Write exactly this content to `src/components/PoemsBlock.astro`:

```astro
---
interface Poem {
  /** BCP-47 language code, e.g. 'en', 'es'. */
  langCode: string;
  /** Short label for the language pill, e.g. 'EN', 'ES'. */
  langLabel: string;
  title: string;
  body: string;
}

interface Props {
  eyebrow: string;
  leadSentence: string;
  poems: Poem[];
}

const { eyebrow, leadSentence, poems } = Astro.props;
---
<section class="border-y border-black/10">
  <div class="max-w-6xl mx-auto px-6 lg:px-10 py-16 lg:py-20">
    <div class="text-center mb-12 max-w-2xl mx-auto">
      <div class="text-xs uppercase tracking-[0.3em] text-[color:var(--color-accent)]">
        {eyebrow}
      </div>
      <p class="mt-4 text-black/70 leading-relaxed">{leadSentence}</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
      {poems.map((p) => (
        <article
          lang={p.langCode}
          class="bg-[color:var(--color-accent-soft)]/20 border border-black/5 rounded-lg p-8"
        >
          <span class="inline-flex text-[10px] uppercase tracking-[0.2em] bg-[color:var(--color-accent)]/10 text-[color:var(--color-accent)] px-2 py-1 rounded">
            {p.langLabel}
          </span>
          <h3 class="mt-3 font-display text-2xl">{p.title}</h3>
          <div class="mt-4 font-display text-lg italic leading-relaxed whitespace-pre-line text-black/80">
            {p.body}
          </div>
        </article>
      ))}
    </div>
  </div>
</section>
```

**Step 2: Type-check**

Run: `npx astro check`
Expected: exit code 0.

---

## Task 5: Scaffold `CaseStudy.astro`

Create the 12-column editorial template that renders each case study.

**Files:**
- Create: `src/components/CaseStudy.astro`

**Step 1: Create the file**

Write exactly this content to `src/components/CaseStudy.astro`:

```astro
---
import LightboxThumb from './LightboxThumb.astro';

interface Thumb {
  src: string;
  alt: string;
}

interface Fact {
  label: string;
  value: string;
}

interface PullQuote {
  body: string;
  attribution: string;
  role: string;
}

interface Props {
  /** URL-anchor id, e.g. "dual-immersion". */
  anchorId: string;
  /** Location, e.g. "Grand Junction, Colorado". Rendered as eyebrow. */
  location: string;
  /** School name. Rendered as the H2. */
  title: string;
  /** Filename under /images/ for the hero image. */
  heroImage: string;
  heroAlt: string;
  /** Lede paragraph(s). Plain text; line breaks become <br>. */
  summary: string;
  /** Optional pull-quote (e.g. Principal testimonial). */
  pullQuote?: PullQuote;
  /** Optional facts rows (e.g. Mascot | Bobcat). */
  facts?: Fact[];
  /** Thumbnail list rendered below the split; each opens the lightbox. */
  thumbs: Thumb[];
}

const {
  anchorId,
  location,
  title,
  heroImage,
  heroAlt,
  summary,
  pullQuote,
  facts,
  thumbs,
} = Astro.props;
---
<section id={anchorId} class="border-t border-black/10">
  <div class="max-w-7xl mx-auto px-6 lg:px-10 py-16 lg:py-24">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
      <div class="lg:col-span-7 min-w-0">
        <img
          src={`/images/${heroImage}`}
          alt={heroAlt}
          loading="lazy"
          decoding="async"
          class="w-full rounded-lg shadow-xl object-cover aspect-[4/5]"
        />
      </div>
      <div class="lg:col-span-5 lg:sticky lg:top-28 lg:self-start">
        <div class="text-xs uppercase tracking-[0.3em] text-[color:var(--color-accent)]">
          {location}
        </div>
        <h2 class="mt-3 font-display text-3xl md:text-4xl lg:text-5xl">{title}</h2>
        <p class="mt-6 text-black/80 leading-relaxed whitespace-pre-line">{summary}</p>

        {pullQuote && (
          <figure class="mt-8 pt-8 border-t border-black/10">
            <blockquote class="italic text-black/80 leading-relaxed border-l-2 border-[color:var(--color-accent)] pl-6">
              &ldquo;{pullQuote.body}&rdquo;
            </blockquote>
            <figcaption class="mt-4 text-sm text-black/70 not-italic pl-6">
              <span class="font-semibold text-[color:var(--color-ink)]">{pullQuote.attribution}</span>
              <span class="block">{pullQuote.role}</span>
            </figcaption>
          </figure>
        )}

        {facts && facts.length > 0 && (
          <dl class="mt-8 pt-8 border-t border-black/10 divide-y divide-black/5">
            {facts.map((f) => (
              <div class="flex items-baseline justify-between py-3">
                <dt class="text-xs uppercase tracking-[0.2em] text-black/50">{f.label}</dt>
                <dd class="text-sm text-black/80 text-right">{f.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </div>

    {thumbs.length > 0 && (
      <div class="mt-12 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
        {thumbs.map((t) => (
          <LightboxThumb src={t.src} alt={t.alt} />
        ))}
      </div>
    )}

    <slot />
  </div>
</section>
```

**Step 2: Type-check**

Run: `npx astro check`
Expected: exit code 0.

---

## Task 6: Smoke-test the components in isolation by building

Before rewriting `murals.astro`, confirm the new components compile.

**Files:** none.

**Step 1: Run the production build**

Run: `npm run build`
Expected: Build completes; no compile errors. (Components are unused so they will not appear in `dist/` yet — that's fine.)

---

## Task 7: Rewrite `src/pages/murals.astro` — frame + hero + feature band

Replace the existing file with the new page structure. Do this in two tasks (hero/feature-band first, case studies second) to keep each task bite-sized.

**Files:**
- Modify: `src/pages/murals.astro` (full rewrite, first half)

**Step 1: Replace the file with this content**

Write exactly this content to `src/pages/murals.astro`:

```astro
---
import Layout from '../layouts/Layout.astro';
import MuralHero from '../components/MuralHero.astro';
import FeatureBand from '../components/FeatureBand.astro';
import CaseStudy from '../components/CaseStudy.astro';
import PoemsBlock from '../components/PoemsBlock.astro';

const features = [
  {
    icon: 'chat' as const,
    label: 'Collaborative Design',
    blurb: "Tailored to your school's values and culture.",
  },
  {
    icon: 'monitor' as const,
    label: 'True-to-Scale Mockup',
    blurb: 'A full-color mockup superimposed onto your actual space.',
  },
  {
    icon: 'pennant' as const,
    label: 'Meaningful Imagery',
    blurb: 'Your mascot, community, and student experience reflected in every element.',
  },
  {
    icon: 'shield' as const,
    label: 'Safe Installation',
    blurb: 'Professional, insured install with minimal disruption to your school day.',
  },
  {
    icon: 'feather' as const,
    label: 'Custom Poem',
    blurb: 'An original poem written to complement the mural.',
  },
  {
    icon: 'sparkles' as const,
    label: 'Protective Finish',
    blurb: 'Clear protective finish for long-lasting vibrancy and durability.',
  },
];
---
<Layout title="Custom School Murals in Colorado | Anna Hileman Art">
  <MuralHero
    eyebrow="School Murals"
    title="These hallways tell"
    titleSuffix="our stories."
    subhead="Lasting visual stories that remind students they are seen, supported, and capable of great things."
    ctaHref="/contact"
    ctaLabel="Commission a Mural"
    image="Dual-Immersion-Academy-School-Mural-8.jpg"
    imageAlt="Dual Immersion Academy hallway mural featuring sunflowers, butterflies, and bobcats"
    imageWidth={2000}
    imageHeight={1333}
  />

  <FeatureBand
    eyebrow="What's Included"
    title="Every School Mural Includes"
    features={features}
  />

  <section class="max-w-3xl mx-auto px-6 lg:px-10 py-16 lg:py-20 text-center">
    <p class="text-lg text-black/80 leading-relaxed">
      School murals transform hallways into places of inspiration, belonging, and pride. Each mural is thoughtfully designed to reflect a school's values, mascot, and community&mdash;celebrating growth, curiosity, kindness, and the unique story of the students who walk its halls every day. Through vibrant color and meaningful imagery, these murals create welcoming environments that support learning and spark imagination.
    </p>
  </section>

  <!-- Case studies inserted in Task 8 -->

  <!-- Final CTA -->
  <section class="border-t border-black/10 bg-[color:var(--color-accent-soft)]/25">
    <div class="max-w-3xl mx-auto px-6 lg:px-10 py-16 lg:py-20 text-center">
      <h2 class="font-display text-3xl md:text-4xl">Ready for a custom mural for your school?</h2>
      <p class="mt-4 text-black/70">Get in touch with Anna using the button below.</p>
      <a
        href="/contact"
        class="mt-10 inline-flex items-center gap-2 bg-[color:var(--color-ink)] text-[color:var(--color-paper)] px-8 py-4 text-sm tracking-wide hover:bg-[color:var(--color-accent)] transition-colors"
      >
        Contact Anna
        <span aria-hidden="true">&rarr;</span>
      </a>
    </div>
  </section>
</Layout>
```

**Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds. `dist/murals/index.html` is written.

**Step 3: Confirm hero + feature band render**

Start dev server if not already running: `npm run dev`

Run: `curl -s http://localhost:4322/murals | grep -o "Every School Mural Includes" | head -1`
Expected: `Every School Mural Includes` (one match).

Run: `curl -s http://localhost:4322/murals | grep -o 'fetchpriority="high"' | head -1`
Expected: `fetchpriority="high"` (confirms LCP hero is eagerly loaded).

---

## Task 8: Add the four case studies to `src/pages/murals.astro`

Append case studies for Dual Immersion, Wingate, Rocky Mountain, and Mesa View.

**Files:**
- Modify: `src/pages/murals.astro`

**Step 1: Define case-study content blocks**

Open `src/pages/murals.astro` and, inside the frontmatter (above the closing `---`), append these constants **after** the `features` array:

```ts
const diaSummary =
  "Each school mural is thoughtfully designed to reflect a school's values, mascot, and community. For Dual Immersion Academy in Grand Junction, the piece celebrates the school's bilingual identity, its bobcat mascot, and the way native flora and fauna ground students in place.";

const diaPoems = [
  {
    langCode: 'en',
    langLabel: 'EN',
    title: 'Beneath the Sun',
    body: `Like bobcats bold beneath the sky, we lift our youth, their spirits high.
With courage and hope, we show the way—
to dream, to grow, to seize each day.
English and Spanish, two voices, one song,
building unity as we journey along.
Honoring differences, together we shine,
bright as the sun, our voices combined.
Sunflowers rise, their roots deep and true.
Grounded in purpose, in all that we do.
Mariposas flutter, bright wings in flight,
symbols of change, of hope, of light.
Friendship blooms, and kindness takes wing,
at DIA where every voice may sing.
With hearts uplifted, our spirits fly,
under the endless, ever-reaching sky.`,
  },
  {
    langCode: 'es',
    langLabel: 'ES',
    title: 'Bajo el Sol',
    body: `Como linces valientes bajo el cielo azul,
alzamos la niñez, su espíritu es luz.
Con fe y esperanza marcamos la vía:
soñar, crecer, vivir cada día.
Inglés y español, dos voces, una canción,
unidos viajamos con un corazón.
Honramos las diferencias, juntos brillamos,
como el sol radiante que alumbra cuando cantamos.
Los girasoles crecen con raíces de fe,
firmes en propósito, firmes en pie.
Las mariposas vuelan, colores danzan,
símbolos de cambio, de luz, de soñar.
Florece la amistad, la bondad se alza ya,
en el DIA cada voz su canto dará.
Con almas alegres nos ponemos a volar,
bajo un cielo eterno que nos quiere abrazar.`,
  },
];

const diaThumbs = [
  { src: 'Dual-Immersion-Academy-School-Mural-4.jpg', alt: 'DIA mural — sunflowers section detail' },
  { src: 'Dual-Immersion-Academy-School-Mural-5.jpg', alt: 'DIA mural — butterflies in flight detail' },
  { src: 'Dual-Immersion-Academy-School-Mural-6.jpg', alt: 'DIA mural — bobcat mascot panel' },
  { src: 'Dual-Immersion-Academy-School-Mural-7.jpg', alt: 'DIA mural — hallway wide view' },
  { src: 'Dual-Immersion-Academy-School-Mural-9.jpg', alt: 'DIA mural — installation progress' },
];

const wingateSummary =
  "Beginning with Wingate's Explorers, Anna aimed to show the vast world ahead for students while weaving in the extraordinary features of the place they call home. Each student and staff member's handprint appears within a ROYGBIV spectrum, signifying their part in the Wingate community. The monarch butterfly anchors the composition as a symbol of transformation.";

const wingateExtendedProse =
  "Anna included local characteristics such as the monument, wild horse, dinosaur fossil, native wildflowers, petroglyphs, and bicycle tracks. The scorpion pays homage to Wingate's history, signifying the connection of past, present, and future, while the stars remind us all to reach for our dreams.\n\nThank you to the Wingate PTO, who planned, funded, and supported this art installation, and to Grand Junction Home Depot, Lowe's, and FCI for supplies and scaffolding.";

const wingateThumbs = [
  { src: 'Handprints-2.jpg', alt: 'Wingate mural — student handprints, orange spectrum' },
  { src: 'Handprints-3.jpg', alt: 'Wingate mural — student handprints, green spectrum' },
  { src: 'Handprints-4.jpg', alt: 'Wingate mural — student handprints, indigo spectrum' },
  { src: 'DosRiosElementary.webp', alt: 'Wingate mural — wide installation view' },
];

const rockySummary =
  "Spanning both exterior and interior walls of Rocky Mountain Elementary, this mural captures the school's core values of education, unity, and nurturing environment. A majestic eagle takes center stage outside, symbolizing strength and ambition, while an 80-foot ribbon inside moves from sunrise to night — a story of growth from protected nest to eagles soaring toward the stars.";

const rockyExtendedProse =
  "Adjacent to the soaring eagle stands a vigilant mother eagle, embodying protection and guidance — a reflection of the dedication of the school's faculty and staff. Beneath the eagle, its wing transforms into a flowing river, symbolizing both the local landscape and the continuous flow of knowledge and life. The Bookcliff mountain range and delicate peach blossoms celebrate the area's unique attributes and the natural beauty inherent in one's journey through life.\n\nInside, the mural continues through an 80-foot ribbon around the atrium that begins at sunrise and moves into night. Bright, vibrant colors energize the space while calming native flora and fauna ground the mural in place — surrounding students each day with reminders of support, movement, and reaching for their dreams.";

const rockyThumbs = [
  { src: 'From-Right-View-RM-Mural.jpg', alt: 'Rocky Mountain Elementary — right-side view of exterior mural' },
  { src: 'Flowers-RM-Mural.jpg', alt: 'Rocky Mountain Elementary — peach blossom detail' },
];

const mesaSummary =
  "Mesa View's mural takes into account the rich history of agriculture, Native Americans, and the geographical locations of Orchard Mesa. The hawk — the school's mascot — signifies the strength and determination carried by students, staff, and families of Mesa View Elementary.";

const mesaExtendedProse =
  "The bees were a last-minute addition after a very large swarm gently hovered over students and families while they placed their handprints on the wall. Thank you to Mesa View PTO, FCI, Orchard Mesa True Value, and Grand Junction Home Depot for supporting this installation.";

const mesaThumbs = [
  { src: 'MV-Mural-Main-Pic-1.jpg', alt: 'Mesa View Elementary — mural wide view' },
  { src: 'Mesa-View-Family-Photo.jpg', alt: 'Mesa View Elementary — families gathered at unveiling' },
  { src: 'Dog-Prints-Mesa-View.jpg', alt: 'Mesa View Elementary — paw-print detail in the mural' },
];
```

**Step 2: Insert the case studies into the page body**

Replace the line `<!-- Case studies inserted in Task 8 -->` with:

```astro
  <CaseStudy
    anchorId="dual-immersion"
    location="Grand Junction, Colorado"
    title="Dual Immersion Academy"
    heroImage="Dual-Immersion-Academy-School-Mural-8.jpg"
    heroAlt="Dual Immersion Academy mural — bobcats, sunflowers, and butterflies beneath a painted sun"
    summary={diaSummary}
    pullQuote={{
      body: "I highly recommend Anna Hileman, who created a mural at our school. She was delightful to work with, understood the unique needs of the population we serve, and completed the project quickly and beautifully.",
      attribution: "Tyler McLaughlin",
      role: "Principal, Dual Immersion Academy",
    }}
    facts={[
      { label: 'Languages', value: 'English · Español' },
      { label: 'Mascot', value: 'Bobcat' },
      { label: 'Location', value: 'Interior hallway' },
    ]}
    thumbs={diaThumbs}
  >
    <PoemsBlock
      eyebrow="An Original Poem by the Artist"
      leadSentence="Each school mural is accompanied by an original poem, written by Anna to deepen the story behind the artwork. For the Dual Immersion Academy, the poem was written in both English and Spanish, mirroring the languages taught at the school."
      poems={diaPoems}
    />
  </CaseStudy>

  <CaseStudy
    anchorId="wingate"
    location="Grand Junction, Colorado"
    title="Wingate Elementary"
    heroImage="Handprints-1.jpg"
    heroAlt="Wingate Elementary mural — student handprints arranged in a monarch butterfly across the wall"
    summary={wingateSummary}
    facts={[
      { label: 'Mascot', value: 'Explorers' },
      { label: 'Scope', value: 'Interior wall + handprint installation' },
    ]}
    thumbs={wingateThumbs}
  >
    <div class="max-w-3xl mx-auto mt-12 text-black/80 leading-relaxed whitespace-pre-line text-[15px] md:text-base">
      {wingateExtendedProse}
    </div>
  </CaseStudy>

  <CaseStudy
    anchorId="rocky-mountain"
    location="Clifton, Colorado"
    title="Rocky Mountain Elementary"
    heroImage="Full-View-RM-Mural-from-Left.jpg"
    heroAlt="Rocky Mountain Elementary exterior mural — eagle, peach blossoms, and Bookcliff mountain range"
    summary={rockySummary}
    facts={[
      { label: 'Mascot', value: 'Eagle' },
      { label: 'Scope', value: 'Exterior + 80-ft interior ribbon' },
    ]}
    thumbs={rockyThumbs}
  >
    <div class="max-w-3xl mx-auto mt-12 text-black/80 leading-relaxed whitespace-pre-line text-[15px] md:text-base space-y-4">
      {rockyExtendedProse}
    </div>
  </CaseStudy>

  <CaseStudy
    anchorId="mesa-view"
    location="Grand Junction, Colorado"
    title="Mesa View Elementary"
    heroImage="MV-Mural-Main-Pic.jpg"
    heroAlt="Mesa View Elementary mural — hawk above Orchard Mesa landscape with bees and handprints"
    summary={mesaSummary}
    facts={[
      { label: 'Mascot', value: 'Hawk' },
      { label: 'Location', value: 'Orchard Mesa, Colorado' },
    ]}
    thumbs={mesaThumbs}
  >
    <div class="max-w-3xl mx-auto mt-12 text-black/80 leading-relaxed whitespace-pre-line text-[15px] md:text-base">
      {mesaExtendedProse}
    </div>
  </CaseStudy>
```

**Step 3: Type-check**

Run: `npx astro check`
Expected: exit code 0, no errors.

**Step 4: Build**

Run: `npm run build`
Expected: Build succeeds.

---

## Task 9: Verify the rendered page end-to-end

Check that every case study, anchor, pull-quote, and poem is present in the rendered HTML.

**Files:** none.

**Step 1: Start dev server if not running**

Run (background): `npm run dev`
Wait until port 4322 is listening.

**Step 2: Verify each case study by anchor id**

Run:
```bash
for id in dual-immersion wingate rocky-mountain mesa-view; do
  echo -n "$id: "
  curl -s http://localhost:4322/murals | grep -o "id=\"$id\"" | head -1
done
```
Expected: each line prints the matching `id="…"` string (no blanks).

**Step 3: Verify the pull-quote text is present**

Run: `curl -s http://localhost:4322/murals | grep -c "Tyler McLaughlin"`
Expected: `1`.

**Step 4: Verify both poems are present**

Run:
```bash
curl -s http://localhost:4322/murals | grep -o "Beneath the Sun" | head -1
curl -s http://localhost:4322/murals | grep -o "Bajo el Sol" | head -1
```
Expected: both phrases print.

**Step 5: Verify language attributes for a11y**

Run: `curl -s http://localhost:4322/murals | grep -oE 'lang="(en|es)"' | sort -u`
Expected: both `lang="en"` and `lang="es"` appear at least once (the DIA poem articles).

**Step 6: Verify every case study has at least one thumbnail**

Run: `curl -s http://localhost:4322/murals | grep -c 'data-lightbox='`
Expected: `≥ 14` (5 DIA + 4 Wingate + 2 Rocky Mountain + 3 Mesa View = 14).

---

## Task 10: Visually verify responsive layout at three breakpoints

Manual visual check using the dev server.

**Files:** none.

**Step 1: Open the page in a browser**

Open: `http://localhost:4322/murals`

**Step 2: Desktop check (viewport ≥ 1280px wide)**

Expected:
- Hero fills the screen at ~80vh with H1 vertically centered.
- Feature band shows 3 icons per row × 2 rows.
- Each case study shows a 12-column split: large image on the left, metadata sidebar on the right.
- Sidebar stays sticky as you scroll within a case study (the image scrolls past, the sidebar holds its position until the next section).
- DIA poems show as two columns side-by-side.
- Thumbnail strips show 6 thumbs per row (Wingate has 4, so it wraps cleanly).

**Step 3: Tablet check (viewport 768–1024px)**

Resize or use DevTools device mode at 900px.

Expected:
- Hero at ~65vh.
- Feature band collapses to 2 columns.
- Case studies collapse to a single column: image on top, metadata beneath, thumbs below.
- Poems remain side-by-side (md breakpoint keeps 2 cols).
- Thumb strips show 3–4 per row.

**Step 4: Mobile check (viewport ≤ 640px)**

Resize or use DevTools at 375px.

Expected:
- Hero at ~55vh, H1 scales down, content bottom-anchored.
- Feature band is a single vertical column.
- Case studies are a single column.
- Poems stack vertically (English on top, Spanish underneath).
- Thumb strips show 2 per row.
- No horizontal scroll anywhere.

**Step 5: Lightbox regression check**

Click any thumbnail on the rendered page.
Expected: existing lightbox opens full-screen; Escape closes it.

---

## Task 11: Delete unused component references and dead code

Prune anything left over from the old `murals.astro` that is no longer used.

**Files:**
- Inspect: `src/components/` — confirm `LightboxThumb.astro`, `ArtImage.astro`, etc. are still used elsewhere before touching them.

**Step 1: Confirm `LightboxThumb.astro` is still in use site-wide**

Run: `grep -rl "LightboxThumb" src/`
Expected: matches in `src/pages/restaurants.astro`, `src/pages/murals.astro`, `src/components/CaseStudy.astro`. **Do not delete.**

**Step 2: Confirm `ArtImage.astro` is still in use site-wide**

Run: `grep -rl "ArtImage" src/`
Expected: matches in `src/pages/index.astro`, `src/pages/about.astro`, `src/pages/garden-gems.astro`, `src/pages/portraits.astro`, `src/pages/custom-artwork.astro`. **Do not delete.**

**Step 3: Confirm the new `murals.astro` does not import anything it no longer uses**

Open `src/pages/murals.astro`, look at its imports. They should be:
```ts
import Layout from '../layouts/Layout.astro';
import MuralHero from '../components/MuralHero.astro';
import FeatureBand from '../components/FeatureBand.astro';
import CaseStudy from '../components/CaseStudy.astro';
import PoemsBlock from '../components/PoemsBlock.astro';
```
Nothing else should be imported. If extra imports linger, remove them.

---

## Task 12: Final verification pass

**Files:** none.

**Step 1: Type-check**

Run: `npx astro check`
Expected: exit code 0, "0 errors, 0 warnings".

**Step 2: Production build**

Run: `npm run build`
Expected: Build succeeds. `dist/murals/index.html` is present.

**Step 3: Verify the sitemap still includes `/murals`**

Run: `grep -o "/murals" dist/sitemap-0.xml | head -1`
Expected: `/murals` prints at least once.

**Step 4: Verify old content is removed from the new page**

Run:
```bash
# The old page had six identical alt strings like this one — should be gone now:
curl -s http://localhost:4322/murals | grep -c 'alt="Dual Immersion Academy school mural"'
```
Expected: `0` (each thumbnail now has a unique alt).

**Step 5: Check the design doc still matches reality**

Open `docs/plans/2026-04-19-murals-page-redesign-design.md` and confirm the "Files Affected" list matches what was actually produced. If anything drifted, update the doc.

---

## Task 13: Update `opti-suggestions.md`

Mark the items this redesign addressed as done so the tracking file stays current.

**Files:**
- Modify: `opti-suggestions.md`

**Step 1: Mark these checkboxes as `[x]` in `opti-suggestions.md`**

- "Fix LCP hero lazy-load" — the new `MuralHero` uses `fetchpriority="high"` + `loading="eager"`.
- "Optimize page titles for local/service intent" → the `murals.astro` line only (the other four pages remain `[ ]`).
- Add a new bullet under "Notes / New Findings":
  > 2026-04-19: Murals page redesigned per `docs/plans/2026-04-19-murals-page-redesign-design.md`. Unique thumbnail alt text now enforced by `CaseStudy.astro`'s `Thumb` type. Other SEO items remain open.

**Step 2: Save the file.**

---

## Done

When every task above is complete and the verification pass in Task 12 is green, the redesign is done. The dev server at `http://localhost:4322/murals` should show the new layout.
