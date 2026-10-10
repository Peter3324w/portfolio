# Peter Phiri — Portfolio

The personal portfolio of Peter Phiri, a product designer and front-end developer. It presents client and product work as long-form case studies and treats the site itself as a piece of that work: a scroll-driven home page, case studies laid out as a horizontal ribbon, and page transitions where one screen physically becomes the next. Nearly all of the motion is hand-written against `requestAnimationFrame`, canvas and WebGL rather than assembled from a library.

**Live:** https://peterbuilds.vercel.app

## Stack

- **Next.js 16** (App Router, React 19, TypeScript in strict mode)
- **Tailwind CSS v4** through `@tailwindcss/postcss`, with a small hand-written layer in `src/app/globals.css`
- **Lenis** for smooth scrolling, and as the single way any section is allowed to drive the page
- **GSAP** for the loading sequence and its portal reveal
- **Canvas 2D and raw WebGL** for the hero background and the cursor effect
- **lottie-react** for the hover-played skill icons
- **next/image** for every screenshot, **next/og** for generated link-preview cards
- **Vercel** for hosting, with Vercel Analytics and Microsoft Clarity (production only)

## What is on the site

### Home

| Section | What it does |
| --- | --- |
| Loading screen | Elder Futhark runes scramble and resolve into the name, then a circular portal opens onto the hero. Shown once per tab session. |
| Hero | A live topographic background (Perlin noise drawn as contour lines with marching squares) under a chrome face that drifts and tilts toward the pointer. |
| Statement | A short positioning line with a scroll-drawn line behind it. |
| Featured projects | Four cards inside a hairline frame. Each image hunts for focus on hover; clicking one pushes the camera into it. |
| Process | A pinned, scroll-driven accordion. The same screen is redrawn at each step's fidelity: notes, flows, wireframe, shipped UI. |
| Skills and contact | A 3x3 grid with a Design / Code switch. On desktop, scrolling flies the camera through the grid's centre cell, down a corridor of process gates and project screens, and out onto the contact section. |

### Case studies

`/projects/metibuy`, `/projects/playtime` and `/projects/skeet` are listed on the home page; `/projects/vertex-lab` is built and reachable by URL. Each is a horizontal ribbon scrolled vertically: an intro tile, then sections of body text followed by two 16:9 screenshots, ending in a "next case study" panel. On phones the ribbon becomes a stacked column.

### Other pages

`/about`, `/resume` (with a downloadable PDF), `/content-creation` (video editing work, with click-to-play YouTube tiles) and `/privacy`.

### The motion system

- **Camera push.** Clicking a project card scales the whole projects section around the card, turns toward it, and dissolves the image into the case study's background, which is already the first frame of the next page. Going back runs the same move in reverse and lands on the scroll position you left.
- **Case-study hand-over.** Keep scrolling past the end of a ribbon and a meter fills (stop, and it drains). When it is full, the next project's panel takes over the screen and its preview title becomes the next page's title.
- **One transition layer.** Both moves are coordinated by a single component in the root layout that survives the route change, using a ready/done handshake so the incoming page starts in the outgoing page's last frame.
- **Prism cursor.** A WebGL motion texture pulls red and blue apart along the pointer's path over images, and the same trail puts a chromatic fringe on headings, letter by letter, without touching layout.
- **Magnetic section entries.** Once a section's edge passes 70% of the screen on the way down, the page carries you the rest of the way in.
- **Responsive by design, not by shrinkage.** Three type steps (below 768px, 768px and up, 1024px and up). The ribbon and the skills fly-through are desktop choreography; below 768px they give way to purpose-built stacked layouts instead of a squeezed copy. The pulls, the fly-through, both page transitions and Prism all respond to `prefers-reduced-motion`.

## Quick start

```bash
npm install
npm run dev
# open http://localhost:3000
```

## Documentation

- [Development setup](docs/development-setup.md) — prerequisites, install, running locally, environment variables
- [Developer documentation](docs/developer-documentation.md) — routes, directory map, adding a case study, design tokens, motion architecture
- [Build and development scripts](docs/build-and-scripts.md) — npm scripts, CI, image and resume pipelines, deployment
- [Roadmap](docs/roadmap.md) — what is done, what is next, what is later
- [License](LICENSE)
