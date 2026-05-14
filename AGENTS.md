# Working with Anna on annahileman.com

## Who Anna is
Anna is an artist. She is not technical. She does not know what Git, GitHub,
branches, commits, or pull requests are, and she does not need to. Translate
everything into plain English. Never ask her to run a git command.

## Two URLs that matter
- Staging (where we test): https://staging.annahileman.com
- Production (the live site the public sees): https://annahileman.com

We ALWAYS make changes on staging first. Production only gets updated when
Anna explicitly says "push this live" or similar.

## The workflow for every change Anna asks for

1. Make sure you're on the `staging` branch. If not, switch to it and `git pull`.
2. Make the change.
3. Commit with a short, plain-English message describing what changed
   (e.g. "Update mural pricing on services page").
4. Push to `origin/staging`.
5. Verify the deploy actually finished before telling Anna it's ready.
   See the "Verifying the deploy" section below.
6. End your reply with:
   - A one-line summary of what you changed
   - The direct URL to the page on staging (e.g. https://staging.annahileman.com/murals)
   - This exact prompt at the bottom:
     > **Looks good?** Just say "push it live" and I'll move this to the real site.
     > **Want changes?** Tell me what to adjust.
     > **Want to undo this?** Say "undo that" and I'll roll it back.

## Verifying the deploy

Cloudflare Pages takes 60-120 seconds to build and deploy after a push. Do
NOT hand Anna a URL until you've verified the deploy is live, otherwise
she'll refresh and see the old version and think something's broken.

The site embeds the current git commit SHA in a meta tag in the page head:
`<meta name="git-commit" content="abc1234">`. Use this to verify.

After pushing:
1. Get the SHA you just pushed: `git rev-parse --short HEAD`
2. Wait 45 seconds (the build needs to start).
3. Fetch https://staging.annahileman.com and check the `git-commit` meta tag.
4. If it matches your SHA, the deploy is live. Tell Anna.
5. If it doesn't match, wait 15 more seconds and check again.
6. If after 3 minutes total it still doesn't match, something's wrong with
   the build. Check the Cloudflare Pages dashboard or tell Anna:
   "The change is pushed but the site is still building. Give it another
   minute and refresh, or let me know and I'll investigate."

## Pushing to production
When Anna says "push it live," "ship it," "make it live," "looks good push to
production," or anything similar:

The `main` branch is protected and cannot accept direct pushes. Use a PR:
1. Make sure `staging` is up to date with origin.
2. Create a PR from `staging` to `main` using the GitHub CLI:
   `gh pr create --base main --head staging --title "Deploy to production" --body "Promoting staging to production"`
3. Merge it immediately (since Anna already approved by saying "push it live"):
   `gh pr merge --merge --auto` or `gh pr merge <number> --merge`
4. Wait for Cloudflare Pages to deploy production (verify the same way as
   staging, but check https://annahileman.com instead).
5. Confirm with: "Done. It's live at https://annahileman.com/[page]."

If `gh` is not installed, fall back to the GitHub API or web URL, but never
try to bypass the branch protection with `git push --force` or similar.

## Undoing things
When Anna says "undo that," "revert," "go back," or similar:
- If the change is only on staging: `git revert` the last commit on staging
  and push. Verify the deploy, then confirm with the staging URL.
- If it's already been pushed to production: revert on staging, push, then
  PR-merge to main (same flow as a normal production push). Tell her both
  URLs are restored once both deploys finish.

Never use `git reset --hard` on a shared branch. Always use `git revert`
so history stays clean.

## Things you must NOT change without explicitly asking Anna first
- Anything in `src/lib/siteIndexing.mjs` (staging vs production indexing logic)
- `robots.txt` or sitemap configuration
- Any JSON-LD / structured data blocks (SEO)
- Formspree form IDs or endpoints
- Google Places API keys or any other API keys, secrets, env vars
- `wrangler.toml`, `astro.config.mjs`, `package.json` dependencies (asking
  about new dependencies in particular)
- `_headers` (caching and security headers)
- The image resolution utility used for data-driven image lookups
- The `main` branch directly (always go through staging + PR)
- DNS, Cloudflare Pages project settings, or build configuration
- AGENTS.md or CLAUDE.md (ask Brian, not Anna)

If Anna asks for something that requires touching any of the above, STOP and
explain in plain English what would need to change and why, then wait for her
to confirm.

## Image handling

The site uses Astro's built-in image optimization. New images get automatic
WebP conversion, content-hashed filenames, and responsive sizing at build
time. This means image filenames in the built site are not the same as the
source filenames; Astro hashes them so caching is safe.

Where images go:
- New artwork, gallery, hero, and content images: save to `src/assets/images/`
  with a descriptive filename (e.g. `mural-downtown-grand-junction-2026.jpg`,
  not `IMG_4827.jpg`).
- Pet portrait images: `src/assets/images/portraits/`
- Favicon and site logo ONLY: stay in `public/images/`. These are referenced
  by the web manifest and JSON-LD and need stable, unhashed URLs.

How to use a new image in a component or page:
- Import the image at the top of the file:
  `import myImage from '../assets/images/my-image.jpg';`
- Use Astro's `<Image>` component, not a raw `<img>` tag:
  `<Image src={myImage} alt="Description here" />`
- For hero images, pass `loading="eager"` and `fetchpriority="high"`:
  `<Image src={myImage} alt="..." loading="eager" fetchpriority="high" />`
- For everything else, the defaults (lazy loading) are correct. Don't
  override them.

For data-driven image references (case studies, gallery lists, etc.) the
codebase has an image resolution utility that handles dynamic lookups.
Look for it under `src/lib/` or `src/utils/` (Brian will know where if
you can't find it). When adding a new image to a data file, add it to the
utility's mapping so the build can find it.

Alt text rules:
- Every image needs descriptive alt text. No exceptions.
- If Anna doesn't give you one, ask her one short question: "What's this
  a picture of?" and use her answer.
- Don't write generic alt like "image" or "artwork." Describe what's in it.

Galleries and lightboxes:
- Use the existing `<LightboxThumb>` and `<LightboxRoot>` pattern. Don't
  invent a new image component.
- Lightbox URLs will automatically point to the optimized WebP versions.

If you're not sure how to wire up a new image, look at how similar images
are handled in the same component or a nearby page and follow that pattern.

## The stack (for your reference, not Anna's)
- Astro 5 + Tailwind CSS 4
- Hosted on Cloudflare Pages
- Repo: brian-dlptest/annahilemanart (public)
- `staging` branch -> annahileman-staging Pages project -> staging.annahileman.com (noindex)
- `main` branch -> annahileman Pages project -> annahileman.com (indexed, protected)
- Contact form: Formspree
- Reviews: Google Places API with manual fallback
- Images: Astro built-in optimization, source images in `src/assets/images/`

## Cloudflare Pages projects
- `annahileman` project watches `main` branch -> annahileman.com
- `annahileman-staging` project watches `staging` branch -> staging.annahileman.com
Both are linked to the same GitHub repo. If a deploy looks stuck, check
the deployments tab of the appropriate project at dash.cloudflare.com.

## Vocabulary translator
When Anna says... it usually means...
- "the homepage" -> `src/pages/index.astro`
- "the murals page" -> `src/pages/murals.astro` (note: there's a redirect from /murals)
- "the about page" -> `src/pages/about.astro`
- "the services page" -> `src/pages/services.astro`
- "the contact form" -> the Formspree-backed form, not the email address
- "the gallery" -> wherever LightboxThumb components appear on the page she means
- "the banner" / "the header" -> the hero section at the top of the page
- "the footer" -> the bottom of every page
- "add this image" or "put this picture on the page" -> save it to
  `src/assets/images/` with a descriptive filename, import it in the relevant
  component, and use the `<Image>` component (see Image handling section)

If you're not sure which page or section she means, ASK. One short question
is always better than guessing and editing the wrong thing.

## How to talk to Anna
- Short. Direct. No jargon.
- No em dashes (her preference, and Brian's).
- Don't explain the git mechanics unless she asks.
- Don't apologize repeatedly. One acknowledgment, then fix it.
- If something fails (build error, deploy fails, etc.), explain in one
  sentence what broke and what you're doing about it.

## Emergencies
If production is broken and Anna is panicking:
1. Don't try to fix forward. Revert staging to the previous commit, push,
   then PR-merge to main.
2. Production will redeploy in ~90 seconds. Verify it the same way as
   any other deploy.
3. Tell her: "The site is back to how it was [X] minutes ago. Now let's
   figure out what went wrong."
