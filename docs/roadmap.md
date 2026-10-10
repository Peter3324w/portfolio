# Roadmap

Nothing here is a dated commitment.

## Done

**Home page**

- Loading screen with rune scramble and portal reveal
- Hero with the live topographic background and pointer-tilted face
- Statement section
- Featured projects in the hairline frame, with hover focus-hunt, screenshot glow and bottom fade
- Pinned process accordion with the four-stage artboard
- Skills grid with the Design / Code switch, and the fly-through to the contact section
- Magnetic entries into the dark chapter and the skills section

**Case studies**

- Metibuy (five sections), PlayTime (five), Skeet (four) and Vertex Lab (four), every image slot filled with a real screenshot
- Horizontal ribbon on desktop, stacked column on phones
- Camera push from a home card into its case study, and the pull-out on the way back
- Over-scroll hand-over from one case study to the next
- Real screenshots on all three listed home cards with an image, each with its soft copy

**Site-wide**

- Custom cursor with light and dark themes and the "Case Study" pill
- Prism cursor effect on images and headings
- About, Resume (with PDF download), Content Creation and Privacy pages
- Generated link-preview cards for the home page and each case study
- Three-step responsive type scale and reduced-motion handling across the motion system
- CI running lint, typecheck and build on `main` and `dark-sections`

## Next

- **CreatorFlow case study.** The card holds its place on the home grid marked coming soon; it needs a record in `src/app/projects/[slug]/page.tsx`, screenshots and a card image.
- **About page imagery.** The avatar is still a grey gradient circle and the cover banner a gradient (`src/app/about/page.tsx`). Needs a square photo, 400 x 400 or larger, and a banner image.
- **Discord contact on `/content-creation`.** `DISCORD` in `src/app/lib/content-data.ts` is empty, which hides the copy button.

## Later

- **Relist Vertex Lab.** It is rested, not retired: the page still builds at `/projects/vertex-lab`. Listing it again means moving its card back into `PROJECTS` and removing `hidden` from its record.
- **Housekeeping.** Remove what is no longer referenced: `src/app/components/animations/HorizontalScroll.tsx`, the starter SVGs in `public/`, superseded card images in `public/images/projects/`, and the installed but unimported packages (`three`, `@react-three/fiber`, `@react-three/drei`, `pixi.js`, `@gsap/react`).
