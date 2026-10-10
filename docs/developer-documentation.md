# Developer documentation

How the site is put together: routes, files, the case-study data model, the design tokens and the motion architecture. Everything here describes the code as it stands.

## Route map

All routes live under `src/app/` (App Router).

| Route | File | Notes |
| --- | --- | --- |
| `/` | `page.tsx` | Server component. Composes the home sections inside `HomeShell`. |
| `/projects/[slug]` | `projects/[slug]/page.tsx` | Case studies. Statically generated for `metibuy`, `playtime`, `skeet` and `vertex-lab`. Unknown slugs return 404. |
| `/about` | `about/page.tsx` | Client page; metadata in `about/layout.tsx`. |
| `/resume` | `resume/page.tsx` | Client page; links to `public/peter-phiri-resume.pdf`. Metadata in `resume/layout.tsx`. |
| `/content-creation` | `content-creation/page.tsx` | Server page on the dark frame; data in `lib/content-data.ts`. |
| `/privacy` | `privacy/page.tsx` | Client page; metadata in `privacy/layout.tsx`. |
| `/opengraph-image` | `opengraph-image.tsx` | Generated link-preview card for the site. |
| `/projects/[slug]/opengraph-image` | `projects/[slug]/opengraph-image.tsx` | Generated card per case study. |

The root layout (`layout.tsx`) mounts four global, render-nothing-or-overlay components before the page: `SmoothScroll`, `CustomCursor`, `PrismText` and `ProjectTransition`. Because they live in the layout they persist across client-side navigation, which the page transitions depend on.

## Directory map

```text
src/
  instrumentation-client.ts     Microsoft Clarity, production only
  app/
    layout.tsx                  Root layout, site metadata, global motion components
    page.tsx                    Home page composition
    globals.css                 Tailwind import, fonts, type scale, hand-written effects
    lib/
      home-data.ts              Home cards, process steps, skills, stack
      content-data.ts           Everything on /content-creation
      lenis.ts                  Registry for the live Lenis instance
      useMagneticPull.ts        The section "pull" hook and its easings
      cameraPush.ts             Home -> case study: constants, types, return state
      handover.ts               Case study -> next case study: constants, types, arrival state
      cursorFx.ts               Tuning for the Prism effect
      prism.ts                  Prism over images (WebGL)
      prismText.ts              Prism over headings (DOM, text-shadow)
      ogCard.tsx                Shared link-preview card
    components/
      SmoothScroll.tsx          Creates Lenis and runs its loop
      ProjectTransition.tsx     The transition layer for both page transitions
      ProjectRibbon.tsx         The whole case-study page body
      NextPanel.tsx             "Next case study" panel constants and furniture
      Nav.tsx, ProjectNav.tsx   Navigation, and its transparent case-study variant
      Footer.tsx, LoadingScreen.tsx, PrismText.tsx, utils.ts
      cursor/CustomCursor.tsx   The cursor
      home/                     Home sections and their hooks
        HomeShell.tsx           Client shell: loading, nav state, scroll memory
        HeroSection.tsx, StatementSection.tsx, DarkZone.tsx
        ProjectsSection.tsx, ProcessSection.tsx, SkillsAndCtaSection.tsx
        FlyCorridor.tsx, StarTags.tsx
        useCameraPush.ts, useFlyThrough.ts
        frame.ts                Frame and hairline class constants
      animations/               Reusable motion pieces
        BlurReveal.tsx, FillToOutline.tsx, ScrollLine.tsx, TopoBackground.tsx
        ProjectCard.tsx, ScrollAccordion.tsx, ProcessArtboard.tsx
        HoverLottie.tsx, usePrism.ts
      content/                  VideoTile.tsx, CopyDiscord.tsx
public/
  fonts/                        Aeonik Regular and Bold (not included, see Development setup)
  images/projects/              Home card images, plus one folder of screenshots per slug
  images/content/               Video thumbnails for /content-creation
  lottie/                       Skill icon animations (eight design, eight code)
  peter-phiri-resume.pdf        The resume offered for download on /resume
```

## Home page composition

`page.tsx` is a server component. It passes plain data from `lib/home-data.ts` into the sections, so only the interactive islands hydrate.

```text
HomeShell (client)
  LoadingScreen
  Nav
  main
    HeroSection
    StatementSection            server
    DarkZone                    black chapter, frame rails, magnetic pull
      ProjectsSection           id="projects"
      ProcessSection            server wrapper around ScrollAccordion
    SkillsAndCtaSection         skills grid, fly-through, contact
  Footer
```

`HomeShell` owns three pieces of cross-section state:

- **Loading.** `loadingDone` gates the hero's reveals. The loading screen plays on a hard load and is skipped on client-side returns (a module-level flag).
- **Nav treatment.** The nav switches to its dark treatment when any element marked `data-nav-dark` (and not `data-nav-dark="off"`) sits under the line 36px from the top, or when the page has scrolled past `main` onto the footer. The fly-through flips its stage's attribute mid-scroll and fires a `navdark` window event so the nav re-checks.
- **Scroll memory.** The home scroll position is kept in a module variable so returning from `/about` restores it; a hard reload starts at the top. The nav's "Projects" item, used from another page, stores `pendingScroll` in `sessionStorage` and the shell scrolls to that id on arrival.

## Case studies

A case study is defined in two places that must stay in step.

### 1. The page record

`projects` in `src/app/projects/[slug]/page.tsx` is a `Record<string, Project>` keyed by slug.

| Field | Purpose |
| --- | --- |
| `name`, `tagline`, `description` | Title, the page `<title>` (`Name: Tagline`), and the intro tile's copy. The meta description is the description cut to 160 characters. |
| `services`, `recognitions` | Lists in the intro tile. |
| `bgColor`, `textColor` | Base tint and text colour. |
| `bgImage` | Optional texture behind the page, under an 80% black overlay. Falls back to `/images/case-study-bg.jpg`. |
| `caseStudyUrl` | The live product. Without it, "Launch project" shows dimmed. |
| `githubUrl`, `pdfUrl` | Optional action icons in the intro tile. |
| `hidden` | Keeps the page built and reachable but out of the "next case study" chain. |
| `sections` | The ribbon's content. |

Each section is `{ images: [CaseStudyImage, CaseStudyImage], text: { eyebrow?, heading, body } }`, with types exported from `ProjectRibbon.tsx`. An image is either `{ type: "image", src, alt }` (use the `img(src, alt)` helper) or `{ type: "placeholder", label }`, which renders a labelled empty frame.

The key order of `projects` is the "next case study" order: each page hands over to the next non-hidden key and the last wraps to the first. A hidden page hands over to the first listed project.

### 2. The home card

`PROJECTS` in `src/app/lib/home-data.ts` drives the home grid, the home page's route prefetching and the link-preview card (name and tagline). `UNLISTED_PROJECTS` holds cards for pages that are off the grid but still need a preview card.

| Field | Purpose |
| --- | --- |
| `name`, `slug`, `tags`, `tagline` | Card text. `slug` must match the key in `projects`. |
| `summary` | Longer blurb, shown only on featured cards. |
| `image` | 16:10 card image. Omit it and the card shows an empty frame. |
| `imageSoft` | 36px copy the camera push dissolves into. |
| `imageOrigin` | CSS transform-origin for the scroll zoom. Defaults to centre; `"left top"` keeps an app's sidebar in view. |
| `bgColor` | Card and transition ground colour. |
| `comingSoon` | Holds a place in the grid without linking anywhere. |

The first two cards get a full row each (`FEATURED = 2` in `ProjectsSection.tsx`); the rest fall into the two-column grid.

### Adding a case study

1. **Start with placeholders.** Add a record to `projects` using `{ type: "placeholder", label: "Landing hero at the top" }` for every image. The labels double as the shot list.
2. **Write the sections.** Two images and one text block each. House rule for a body: 90 words at most, 75 to 85 the target.
3. **Add the home card** to `PROJECTS` with the same slug, in the same position as in `projects`. If the card already exists as `comingSoon`, remove that flag.
4. **Shoot and wire the images.** Save tiles under `public/images/projects/creatorflow/` (using the new slug) and swap each placeholder for `img("/images/projects/creatorflow/dashboard.webp", "Alt text describing the screen")`. Add the 16:10 card image and its soft copy. Sizes are in [Build and development scripts](build-and-scripts.md#case-study-screenshots).
5. **Check.** `npm run build` pre-renders the new route and its preview card from `generateStaticParams`.

To rest a case study without deleting it, set `hidden: true` on its record and move its card from `PROJECTS` to `UNLISTED_PROJECTS`. To bring it back, reverse both.

## Design tokens

Tailwind v4 is used with its default theme; there is no `@theme` block and no config file. The site's own tokens are deliberately few, and they live in three places.

### Type scale (`globals.css`)

Five role classes in `@layer components`, all set in Aeonik (`--font-aeonik`, the only CSS custom property the stylesheet defines). Use these rather than raw Tailwind text sizes for anything that plays one of these roles.

| Class | Weight | Below 768px | 768px and up | 1024px and up | Line height | Case |
| --- | --- | --- | --- | --- | --- | --- |
| `.text-h1` | 700 | 36px | 48px | 64px | 1.12 | Uppercase |
| `.text-h1-reg` | 400 | 36px | 48px | 64px | 1.12 | Uppercase |
| `.text-h2` | 400 | 28px | 36px | 48px | 1.41 | Uppercase |
| `.text-subheading` | 400 | 18px | 22px | 28px | 1.12 | Uppercase |
| `.text-body` | 400 | 15px | 16px | 18px | 1.32 | As written |

Letter-spacing is `0em` throughout. Values were converted from Figma: percent letter-spacing divided by 100 becomes `em`, percent line-height divided by 100 becomes unitless.

The case-study title is the one deliberate exception: `CASE_TITLE_CLASS` in `NextPanel.tsx` (56px, 72px from `lg`), shared by the intro tile's heading and the next panel's preview so one can become the other.

### Colour

Colours are literal values used through Tailwind arbitrary classes, not variables.

| Value | Role |
| --- | --- |
| `#f6f6f6` | Paper: the light background and light text on dark |
| `#111111` | Ink: text and lines on the light background |
| `#000` | The black home chapter and the body background |
| `#0a0a0a` | Case-study and card ground, preview cards |
| `#c2c3c7` | The grey of the next panel's preview title |

Secondary text is ink or paper at reduced opacity (for example `text-[#111111]/70`, `text-[#f6f6f6]/60`).

### Frame and hairlines (`components/home/frame.ts`)

The black half of the home page and `/content-creation` sit inside one frame whose rails line up with the nav's content box.

| Constant | Classes | Use |
| --- | --- | --- |
| `FRAME_GUTTER` | `px-6 md:px-12` | Page gutter |
| `FRAME` | `mx-auto w-full max-w-[1296px]` | Content box |
| `LINE` | `border-white/[0.16]` | Rails and full-bleed rules between rows |
| `LINE_WEAK` | `border-white/[0.09]` | Dividers inside the frame |
| `LINE_INK` | `border-[#111111]/14` | Rails on the light background |
| `LINE_INK_WEAK` | `border-[#111111]/8` | Inner dividers on the light background |

### Effect classes (`globals.css`, unlayered)

These are plain CSS on purpose, so they do not compete with utilities on specificity.

| Class | Effect |
| --- | --- |
| `.shot-glow` | One blurred pill of light behind a screenshot, clipped by its `.glow-cell` parent; brightens on hover |
| `.shot-fade`, `.shot-edge` | The screenshot's bottom fade into black and its fading hairline edge |
| `.soft-shade` | The inked equivalent of the glow, drawn as a gradient so scaling it stays cheap |
| `.hatch`, `.hatch-ink` | 1px verticals every 8px, at 3.5% white or 5% ink |
| `.hatch-hole` | Clears an oval in the hatch behind centred text |
| `.blur-reveal`, `.blur-visible` | The blur-to-sharp reveal states |
| `.pa-twinkle`, `.pa-spark`, `.pa-sweep` | The loops inside the process artboard |

### Breakpoints and easing

- **768px** is the line between the phone layout and everything else, in CSS (`md:`) and in JavaScript (`window.innerWidth < 768` gates the pulls, the fly-through and the ribbon).
- **1024px** is the third type step. `.shot-glow` also softens below 600px.
- The recurring easing for hover fills and UI transitions is `cubic-bezier(0.23, 1, 0.32, 1)`.

## Motion architecture

The rule that shapes everything: per-frame work writes `transform` and `opacity` only, geometry is measured once (and on resize) rather than read back every frame, and loops stop when nothing is moving or visible.

### Smooth scroll

`SmoothScroll.tsx` creates one Lenis instance (duration 1.2, exponential ease-out, smooth wheel), drives it from `requestAnimationFrame`, forces the page to the top on load and sets scroll restoration to manual.

The instance is published through `lib/lenis.ts`. **Anything that drives the page must call `getLenis()`**, because `window.scrollTo` would be fought by the smooth-scroll loop. For reduced-motion visitors the instance is not published, so `getLenis()` returns `null` and callers treat that as "do not move the page". The transitions also use it to `stop()` and `start()` scrolling while they run.

### Magnetic pull (`lib/useMagneticPull.ts`)

`useMagneticPull(ref, { at, seconds, easing, landing })`: once the element's top edge has passed `at` (default 0.7 of the viewport height) on a downward scroll, Lenis carries the page the rest of the way with the wheel locked. It never drives upward scrolling, starts disarmed, and re-arms only when the edge is back beyond 95% of the viewport. Disabled below 768px and when there is no Lenis instance.

Used by `DarkZone` (1.8s, cubic ease-out) and `SkillsAndCtaSection` (1.2s, exponential ease-out).

### GSAP

GSAP is used in exactly one place, `LoadingScreen.tsx`: a 3.5s progress tween that locks the rune scramble letter by letter, the content fade, and the 3.2s portal reveal, which animates a radial-gradient mask radius while the hero settles from scale 1.15 to 1. While the overlay is up it sets `data-topo-paused` on `<html>` so the hero canvas does not draw underneath it.

Everything else below is hand-written.

### Hero

`TopoBackground.tsx` draws Perlin-noise contour lines with marching squares on a 2D canvas. Device pixel ratio is capped at 1.5 and an `IntersectionObserver` stops the loop once the hero is off screen. `HeroSection.tsx` eases the face toward the pointer (translate plus up to 18 degrees of tilt). `FillToOutline` turns large heading letters from filled to outlined near the pointer (skipped below 50px font size), and `BlurReveal` handles blur-to-sharp entrances site-wide, triggering immediately for content already scrolled past.

### Process section

`ScrollAccordion.tsx` is a sticky, full-height stage inside a tall section. Scroll progress is cut into `steps + 2` slices: a lead-in with nothing open, one slice per step, and a tail that keeps the last step open. Progress bars are written directly to the DOM rather than through React state. `ProcessArtboard.tsx` redraws one screen at the open step's fidelity and pauses its SVG loops whenever it is off screen.

### Skills fly-through (`home/useFlyThrough.ts`, `home/FlyCorridor.tsx`)

Desktop only. The section pins, and every element in the stage with `data-fly` is a plane at a depth along one 7000px corridor:

| `data-fly` | What it is |
| --- | --- |
| `wall` | The skills grid; its centre cell is a hole onto the corridor |
| `gate` | A hairline frame per process step |
| `panel` | Project screens and a code panel, hung off-axis with `data-x` / `data-y` |
| `end` | The contact section, the light at the end |

`data-z` is depth in pixels; planes paint in DOM order, so DOM order is depth order. Scrolling moves the camera; a canvas adds dust and streaks projected through the same lens, and the vanishing point follows the mouse slightly. Planes are promoted to compositor layers only while the camera moves, so a stopped frame is re-rastered sharp. With reduced motion there is no travel: the grid holds, then the contact section fades in. Below 768px the section is a stacked layout and the contact block zooms in as it enters view.

### Page transitions

Both transitions share one layer, `ProjectTransition.tsx`, and one handshake. The moves are coordinated with window `CustomEvent`s and two small module-level stores, because the outgoing page, the layer and the incoming page are three different components.

| Event | Fired by | Meaning |
| --- | --- | --- |
| `project:push` | `useCameraPush` | Home is pushing into a card; detail carries the href, start time and ground |
| `project:handover` | `ProjectRibbon` | The next-project meter is full; detail carries the panel and title geometry |
| `project:handoverReady` | `ProjectRibbon` (incoming page) | The new page has painted its first frame |
| `project:handoverDone` | `ProjectTransition` | The layer is gone; play the entrance |

If the incoming page never reports ready, a 4 second fallback clears the pending state and restarts scrolling so the visitor is never left stuck.

**Home to case study: the camera push** (`lib/cameraPush.ts`, `home/useCameraPush.ts`). Cards opt in with `data-push-shot="metibuy"`, containing a `data-push-lens` (the image layer that moves) and an optional `data-push-soft` (the blurred stand-in). Text that should clear first carries `data-push-fade`. On hover the image hunts for focus and its focus point follows the pointer on a second-order spring. On click, over 1.5s: text fades, the whole projects section scales around the screen centre while the card travels to it with a slight turn and handheld wobble, and the image dissolves into the case study's ground, which `ProjectTransition` fades in on the same clock before navigating. Links keep a real `href`, so keyboard, middle-click and modifier-clicks behave normally.

**Back to home: the pull-out.** A push remembers the slug and scroll position it left from. When a case study unmounts toward `/` it marks a pending return, and the home page opens already pushed into that card under the case study's ground, then runs the same move backwards. Clicking a home link from a case study first fades the page to its bare ground.

**Case study to case study: the hand-over** (`lib/handover.ts`). At the end of the ribbon, further wheel, touch or key input feeds a meter (900px of scrolling to fill; it drains at 1.2 per second once input stops). The panel leans in as it fills. When full, the panel expands to cover the screen over 1s, changes into the next project's background, and its preview title travels to where the next page's title starts. The next page begins in that exact frame and its title glides home.

Tuning for all three lives in the exported `CAMERA_PUSH` and `HANDOVER` objects.

### Case-study ribbon (`ProjectRibbon.tsx`)

From 768px the section is as tall as the viewport plus the ribbon's overflow divided by `SCROLL_PACE` (1.4 horizontal pixels per pixel scrolled), with a sticky full-height stage whose track is translated sideways. Media are `clamp(360px, calc(100vh - 262px), 1000px)` tall, 16:9, 80px apart, with 20px corners.

- **Image tiles** unfold as they arrive from the right: from tilted, slightly scaled-down and clipped to their resting form.
- **Text tiles** fill word by word in reading order over about 2.5s once their left edge reaches 70% of the viewport width. Words are promoted to their own layers only while they fade.
- **Geometry** is measured up front and again when web fonts finish loading, since they change the text tiles' widths.
- Below 768px the sticky stage is hidden and the same content renders as a stacked column with 4:3 centre-cropped images.

### Cursor

`CustomCursor.tsx` hides the native cursor site-wide (`cursor: none` in `globals.css`) and draws its own, pinned exactly to the pointer each frame. It is hidden below `md`.

| Attribute | Effect |
| --- | --- |
| `data-cursor-theme="light"` or `"dark"` | The nearest ancestor decides the cursor's colour |
| `data-cursor="case-study"` | Turns the spinning reticle into the "Case Study" pill |

**Prism** is the trail effect, tuned in `lib/cursorFx.ts`. It runs only on devices with a fine pointer and hover, and never with reduced motion.

- **Images** (`lib/prism.ts`, attached with the `usePrism(ref)` hook). Each image gets a WebGL canvas laid over it as its next sibling, so it inherits every transform and clip. A per-canvas motion texture stamps a capsule along the pointer's path each frame, lets the paint flow and fade, and the final pass samples red and blue apart along that motion. One shared loop drives every instance and sleeps 3.5s after the last input. Device pixel ratio is capped at 1.5.
- **Headings** (`lib/prismText.ts`, started once by `PrismText`). Every `h1` to `h3` at 24px or larger, and anything marked `data-prism-text`, is split into one span per letter. Letters near the trail get a red and a cyan `text-shadow`. Only `text-shadow` changes, so nothing re-lays out. Opt out with `data-prism-text="off"`.

### Other pieces

- `ScrollLine.tsx` draws its SVG stroke with scroll progress (statement section, desktop).
- `HoverLottie.tsx` plays a skill icon's Lottie file on hover.
- `content/VideoTile.tsx` shows a local thumbnail and swaps in the YouTube player on click, so nothing loads from YouTube until then.

## Conventions

- **Server first.** Pages and static sections are server components; data files have no React imports so they stay off the client bundle. Add `"use client"` only to the island that needs it. A client page puts its metadata in a sibling `layout.tsx`.
- **Drive the page through Lenis**, never `window.scrollTo`, and treat a missing instance as "do not move".
- **Animate `transform` and `opacity`.** Measure geometry once; let scroll handlers only write. Promote layers with `will-change` only for the duration of a move.
- **Stop loops that cannot be seen.** Canvas and SVG loops pause off screen.
- **Respect `prefers-reduced-motion`** in any new scroll-driven or transition effect, and gate desktop-only choreography at 768px.
- **Mark surfaces, do not special-case them.** Dark sections declare `data-nav-dark` and `data-cursor-theme` and the nav and cursor adapt.
- **Images go through `next/image`** with an honest `sizes`. Any new `quality` value must be added to `images.qualities` in `next.config.ts`. A replaced image gets a new filename.
- **Tuning lives in one exported object** per effect (`CAMERA_PUSH`, `HANDOVER`, `CURSOR_FX`), not scattered through the code.
- **Comments explain why**, especially where an earlier approach was tried and dropped.
