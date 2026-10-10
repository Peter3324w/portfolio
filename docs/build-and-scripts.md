# Build and development scripts

## npm scripts

Defined in `package.json`.

| Command | Runs | Notes |
| --- | --- | --- |
| `npm run dev` | `next dev` | Dev server on http://localhost:3000. |
| `npm run build` | `next build` | Production build. Case-study pages and their link-preview images are pre-rendered from `generateStaticParams`. |
| `npm run start` | `next start` | Serves the production build on port 3000. Run `npm run build` first. |
| `npm run lint` | `eslint` | Flat config in `eslint.config.mjs`. |

There is no typecheck script; run the compiler directly:

```bash
npx tsc --noEmit
```

## Checking a change before pushing

The same three checks CI runs, in the same order:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

## Continuous integration

`.github/workflows/ci.yml` runs on every push to `main` and `dark-sections`, and on every pull request. One job on Ubuntu with Node 22:

1. `npm ci`
2. `npm run lint`
3. `npx tsc --noEmit`
4. `npm run build`

A newer push to the same branch cancels the run still in progress.

## Branches and deployment

- **`dark-sections`** is the working branch. Day-to-day changes land here.
- **`main`** is the deployed line. It is the repository's default branch and is merged into only when a set of changes is ready to go live.

The site is hosted on Vercel at https://peterbuilds.vercel.app. Deployment is handled by Vercel's Git integration: the repo contains no `vercel.json` and no deploy script, so the build Vercel runs is the standard `next build`. The production URL is also hard-coded as `metadataBase` in `src/app/layout.tsx` and printed on the link-preview card in `src/app/lib/ogCard.tsx`; change both if the domain changes.

Set `NEXT_PUBLIC_CLARITY_ID` in the Vercel project's environment variables to enable Microsoft Clarity in production. Without it the site builds and runs normally.

## Asset pipelines

The repo has no `scripts/` folder. Screenshots and the resume PDF are produced outside the build and committed as finished files.

### Case-study screenshots

The specs that matter when adding or replacing a screenshot:

| Asset | Size | Format | Location |
| --- | --- | --- | --- |
| Case-study tile | 2880 x 1620 (16:9), captured at 1920 x 1080 with a device scale factor of 1.5 | WebP, quality 90, no resize | `public/images/projects/metibuy/landing-hero.webp` and siblings, one folder per slug |
| Home card | 1600 x 1000 (16:10), hero in the top band | WebP | `public/images/projects/metibuy-hero.webp` |
| Home card, soft copy | 36 x 23, slightly blurred | WebP | `public/images/projects/metibuy-hero-soft.webp` |

Things to know:

- On phones a case-study tile is cropped to 4:3 from the centre, so keep the subject inside the middle 75% of the width.
- Phone screenshots are captured at 390 x 844 at 3x, given 50px corners and a soft shadow, and centred on the same 2880 x 1620 canvas so they sit in a 16:9 slot without stretching.
- The soft copy is what the camera push dissolves into on the way into a case study. Every home card with an image needs one.
- **Give a replaced image a new filename.** `/_next/image` output is cached by URL in the browser and at Vercel's edge, so overwriting a file in place keeps serving the old picture.
- Tiles are served with `sizes="(min-width: 768px) 2560px, 100vw"` and `quality={90}` because the ribbon paints them far wider than their layout box. The `90` must stay listed in `images.qualities` in `next.config.ts`.

### Resume PDF

`public/peter-phiri-resume.pdf` is the file the `/resume` page offers for download. Its content mirrors `src/app/resume/page.tsx`, so change both together. The PDF is rendered from an HTML source with Playwright's Chromium using `page.pdf({ printBackground: true, preferCSSPageSize: true })`; the source and the script are kept outside this repository.

### Link-preview images

These need no manual step. `src/app/opengraph-image.tsx` and `src/app/projects/[slug]/opengraph-image.tsx` generate 1200 x 630 PNG cards at build time through `src/app/lib/ogCard.tsx`, using each project's name and tagline from `src/app/lib/home-data.ts`.
