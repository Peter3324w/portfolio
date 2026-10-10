# Development setup

## Prerequisites

- **Node.js 20.9 or newer.** Next.js 16 requires it; CI runs Node 22, so 22 is the safest match.
- **npm.** The repo is locked with `package-lock.json`.
- **Git.**

Nothing else is needed: there is no database, no backend and no required environment variable.

## Install and run

```bash
git clone https://github.com/Peter3324w/portfolio.git
cd portfolio
npm install
npm run dev
```

The dev server listens on **http://localhost:3000** (the Next.js default; the `dev` script sets no port). To use another port:

```bash
npm run dev -- -p 3010
```

## Run it from the Linux filesystem on WSL

On Windows with WSL2, keep the repo on the WSL ext4 filesystem (for example `~/portfolio`), not under `/mnt/c`. The Next dev server is unstable on the mounted Windows drive: it exits shortly after reporting ready, and installs take many times longer. Clone into the Linux home directory and edit from there.

## Environment variables

There is one, and it is optional.

| Variable | Used in | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_CLARITY_ID` | `src/instrumentation-client.ts` | Microsoft Clarity project ID. Clarity is initialised only when this is set **and** `NODE_ENV` is `production`, so it never runs in development. |

Local development needs no `.env` file. `.env*` files are git-ignored.

Vercel Analytics (`@vercel/analytics`) is mounted in `src/app/layout.tsx` and needs no configuration.

## Next.js 16 notes

- This is Next.js 16, which has breaking changes from earlier majors in its APIs, conventions and file structure. Before writing code against a Next API, read the matching guide in the docs that ship with the installed version, at `node_modules/next/dist/docs/`, and heed deprecation notices.
- Route `params` are a Promise and must be awaited. See `src/app/projects/[slug]/page.tsx` and its `opengraph-image.tsx`.
- `useRouter()` can return a new reference across navigations. `src/app/components/ProjectTransition.tsx` pins it in a ref so a transition's effect is not re-triggered mid-flight.
- `next/image` only serves `quality` values declared in `images.qualities`. `next.config.ts` declares `[75, 90]`; requesting any other value returns a 400 and the image fails to load.
- Client-side instrumentation lives in `src/instrumentation-client.ts`.

## Editor and tooling

- TypeScript is strict. The `@/*` path alias maps to `src/*` (`tsconfig.json`), although the code currently uses relative imports.
- ESLint uses the flat config in `eslint.config.mjs` (`eslint-config-next` core-web-vitals and TypeScript presets).
- Tailwind v4 has no `tailwind.config` file; it is enabled by `@import "tailwindcss"` in `src/app/globals.css` and the `@tailwindcss/postcss` plugin in `postcss.config.mjs`.

## Fonts

The site is set in Aeonik (Regular and Bold), a commercial typeface that is licensed separately and is not included in this repository. Without the files the site still builds and runs: text falls back to the system sans-serif, and link-preview images use the renderer's built-in face.

To see the site as designed, place your own licensed copies at `public/fonts/AeonikTRIAL-Regular.otf` and `public/fonts/AeonikTRIAL-Bold.otf`, the paths `src/app/globals.css` and `src/app/lib/ogCard.tsx` read from.
