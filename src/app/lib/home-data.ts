// Home-page data: plain constants with no React imports so they can live in
// server components and stay off the client JS bundle.

export type ProjectCard = {
  name: string;
  slug: string;
  tags: string[];
  // Omit until there's a screenshot; the card shows an empty frame instead.
  image?: string;
  // A tiny (36px) copy of the image, 16:10, that the camera push dissolves
  // into; scaled up, the browser's smoothing makes it read as a blur.
  imageSoft?: string;
  // Where the scroll zoom grows from (CSS transform-origin). Defaults to the
  // centre; an app screen with a sidebar anchors "left top" to keep it in view.
  imageOrigin?: string;
  bgColor: string;
  // One-line description under the name (mirrors the case study's tagline).
  tagline?: string;
  // Longer blurb, only shown for the featured projects.
  summary?: string;
  // No case study yet: the card holds its place in the grid but doesn't link.
  comingSoon?: boolean;
};

// Order matches `projects` in projects/[slug]/page.tsx, which drives the
// "Next case study" link. Client work leads.
export const PROJECTS: ProjectCard[] = [
  {
    name: "Metibuy",
    slug: "metibuy",
    tags: ["Client Work", "UI Redesign", "E-commerce"],
    // The redesigned landing page's own hero, cropped to 16:10 from the
    // case-study shot. Named -hero rather than overwriting the old
    // metibuy.webp in place: both the browser and Vercel's edge cache
    // optimized images by URL, so reusing the name serves the old picture.
    image: "/images/projects/metibuy-hero.webp",
    imageSoft: "/images/projects/metibuy-hero-soft.webp",
    bgColor: "#0a0a0a",
    tagline: "Marketplace Redesign",
    summary:
      "A front-end redesign for a client's marketplace, from the landing page to admin.",
  },
  {
    name: "PlayTime",
    slug: "playtime",
    tags: ["Product Design", "Desktop App", "Landing Page"],
    // The real Home screen (case-study shot 01 L), cut to 16:10 from the left.
    image: "/images/projects/playtime-app.webp",
    imageSoft: "/images/projects/playtime-app-soft.webp",
    imageOrigin: "left top",
    bgColor: "#0a0a0a",
    tagline: "Game-Time Tracker for Windows",
    summary:
      "Tracks your hours in every game, not just Steam's. I designed and built it all.",
  },
  {
    name: "Skeet",
    slug: "skeet",
    tags: ["Contract Work", "UI/UX Design", "Web App"],
    // The landing hero cut to 16:10 by trimming WIDTH, not height, so none of
    // the editor screen in the shot is lost. Drawn object-cover object-top.
    image: "/images/projects/skeet-hero.webp",
    imageSoft: "/images/projects/skeet-hero-soft.webp",
    bgColor: "#0a0a0a",
    tagline: "Video Editor in the Browser",
  },
  {
    name: "CreatorFlow",
    slug: "creatorflow",
    tags: ["Product Design", "AI Products", "Full-Stack Build"],
    bgColor: "#0a0a0a",
    tagline: "AI Content Platform",
    comingSoon: true,
  },
];

// Taken off the home grid on 2026-10-02 to make room for Skeet, which keeps the
// grid at four. Nothing is deleted: /projects/vertex-lab still renders (its
// record in projects/[slug]/page.tsx is marked `hidden`), and listing it again
// is a matter of moving this card back into PROJECTS above.
export const UNLISTED_PROJECTS: ProjectCard[] = [
  {
    name: "Vertex Lab",
    slug: "vertex-lab",
    tags: ["Web & Product Design", "AI Products", "Full-Stack Build"],
    // The site's own hero, cropped to 16:10 from the full height. Replaces the
    // 1235x786 screen cut out of a mockup, which the card was upscaling. New
    // filename on purpose: /_next/image is keyed by URL, so overwriting one in
    // place serves the old picture from cache long after the file changed.
    image: "/images/projects/vertex-lab-home.webp",
    imageSoft: "/images/projects/vertex-lab-home-soft.webp",
    bgColor: "#0a0a0a",
    tagline: "Two-Person Product Studio",
    summary:
      "We design and build web and AI products, for clients and for ourselves.",
  },
];

export type ProcessStep = {
  title: string;
  body: string;
  tags: string[];
};

export const PROCESS_STEPS: ProcessStep[] = [
  {
    title: "01 — Understand",
    body:
      "Before a single frame is opened, I need to understand the problem completely — who it's for, what they need, and what's getting in the way. This is where I ask the uncomfortable questions.",
    tags: ["User Research", "Competitive Analysis"],
  },
  {
    title: "02 — Define",
    body:
      "From the mess of research, I extract a clear direction. What does success actually look like? What are we solving, and what are we deliberately not solving? This is where the product gets its backbone.",
    tags: ["Problem Framing", "User Flows", "Information Architecture"],
  },
  {
    title: "03 — Design",
    body:
      "Now the craft begins. I move fast in low fidelity, kill bad ideas early, then slow down to get the details right. Every decision — spacing, hierarchy, interaction — earns its place.",
    tags: ["Wireframes", "UI Design", "Prototyping", "Design Systems"],
  },
  {
    title: "04 — Refine & Ship",
    body:
      "Design doesn't end at handoff. I test, gather feedback, iterate, and stay close through delivery. The goal isn't a finished file — it's a product that actually works for real people.",
    tags: ["Usability Testing", "Iteration", "Developer Handoff"],
  },
];

// Skills list — `lottie` is the path to the hover animation JSON. Rendered by
// HoverLottie in the client section.
export type SkillCard = {
  title: string;
  desc: string;
  lottie: string;
};

// `null` entries are intentional empty grid cells (used for the zoom-through
// layout's center gap on desktop).
export const SKILLS: Array<SkillCard | null> = [
  {
    title: "User Research",
    desc: "Interviews and usability testing that uncover what users truly need.",
    lottie: "/lottie/question-hub.json",
  },
  {
    title: "Mobile Design",
    desc: "Thumb-friendly interfaces crafted for small screens.",
    lottie: "/lottie/phone.json",
  },
  {
    title: "Web Design",
    desc: "Responsive sites that balance clarity and craft.",
    lottie: "/lottie/dashboard.json",
  },
  {
    title: "Wireframing",
    desc: "Low-fidelity sketches that map structure and flow before pixels arrive.",
    lottie: "/lottie/tablet.json",
  },
  null, // empty middle cell
  {
    title: "Design Systems",
    desc: "Scalable component libraries and tokens that keep teams shipping cleanly.",
    lottie: "/lottie/Integration.json",
  },
  {
    title: "Visual Design",
    desc: "Type, color, and composition giving every surface clear hierarchy.",
    lottie: "/lottie/Palette.json",
  },
  {
    title: "Prototyping",
    desc: "Interactive Figma flows that make ideas testable before engineering starts.",
    lottie: "/lottie/Activate.json",
  },
  {
    title: "UX Writing",
    desc: "Microcopy and voice that guide users and reduce everyday friction.",
    lottie: "/lottie/note.json",
  },
];

// The "Code" side of the skills switch. Same shape and the same empty centre
// cell, so the grid geometry (and the zoom through it) doesn't change.
export const CODE_SKILLS: Array<SkillCard | null> = [
  {
    title: "Front-end Development",
    desc: "React and Next.js interfaces, typed end to end with TypeScript.",
    lottie: "/lottie/code-frontend.json",
  },
  {
    title: "Design to Code",
    desc: "Figma designs rebuilt in React, down to the spacing and hover states.",
    lottie: "/lottie/code-design-to-code.json",
  },
  {
    title: "Desktop Apps",
    desc: "Electron apps for Windows, from the tray icon to the installer.",
    lottie: "/lottie/code-desktop.json",
  },
  {
    title: "Responsive Layouts",
    desc: "Breakpoint systems that hold a layout together from phone to widescreen.",
    lottie: "/lottie/code-responsive.json",
  },
  null, // empty middle cell
  {
    title: "Backend & Auth",
    desc: "Accounts, databases and real-time features on Supabase and Postgres.",
    lottie: "/lottie/code-backend.json",
  },
  {
    title: "Payments",
    desc: "Checkout, subscriptions and webhooks, wired up with Paddle.",
    lottie: "/lottie/code-payments.json",
  },
  {
    title: "Performance",
    desc: "Profiling slow pages and cutting the work each frame has to do.",
    lottie: "/lottie/code-performance.json",
  },
  {
    title: "Shipping & Deployment",
    desc: "Vercel deploys, GitHub releases and Windows installers.",
    lottie: "/lottie/code-shipping.json",
  },
];

// Languages and tools, listed under the skills grid whichever side is showing.
export const STACK = [
  "TypeScript",
  "JavaScript",
  "HTML",
  "CSS",
  "React",
  "Next.js",
  "Tailwind CSS",
  "Node.js",
  "Electron",
  "Supabase",
  "PostgreSQL",
  "Figma",
];
