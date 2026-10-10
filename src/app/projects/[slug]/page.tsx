import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProjectNav from "../../components/ProjectNav";
import { CASE_STUDY_BG_FALLBACK } from "../../lib/handover";
import ProjectRibbon, {
  type CaseStudyImage,
  type CaseStudySection,
} from "../../components/ProjectRibbon";

type Project = {
  name: string;
  tagline: string;
  description: string;
  services: string[];
  recognitions: string[];
  bgColor: string;
  textColor: string;
  // The live product or site. Without one, Launch project shows dimmed.
  caseStudyUrl?: string;
  sections: CaseStudySection[];
  // Optional action-icon destinations surfaced in the intro tile, next to
  // Launch project. The GitHub icon only appears on projects that set it.
  githubUrl?: string;
  pdfUrl?: string;
  // Background texture behind this case study, sat under an 80% black overlay.
  // Omit to fall back to CASE_STUDY_BG_FALLBACK.
  bgImage?: string;
  // Off the home grid and out of the "Next case study" chain, but still built
  // and still reachable at its own URL. Set on a case study that is being
  // rested rather than retired.
  hidden?: boolean;
};


// Every slot has its screenshot now. ProjectRibbon still renders the
// `placeholder` variant, so a new case study can go back to labelled empty
// frames with `{ type: "placeholder", label: "..." }` while its shots are taken.

// A shot that exists, under public/images/projects/<slug>/. 16:9, 2560 x 1440.
const img = (src: string, alt: string): CaseStudyImage => ({ type: "image", src, alt });

// Order here is the "Next case study" order, so keep it in step with PROJECTS
// in lib/home-data.ts.
//
// House rule for a section body: 90 words hard cap, 75-85 the target. Measured
// off the three case studies written first, which run 72-93 and average 84 —
// Skeet's first draft came in at 151-189 and read as a wall beside them.
const projects: Record<string, Project> = {
  metibuy: {
    name: "Metibuy",
    tagline: "Marketplace Redesign",
    description:
      "Client work. Metibuy is an online marketplace where people shop and sellers open their own stores. The backend was already built by the client's team; I redesigned the front end, from the landing page through shopping, checkout, seller tools and admin.",
    services: [
      "Client Project",
      "UI Redesign",
      "Front-end Build (Next.js)",
      "Design System",
    ],
    recognitions: [],
    bgColor: "#0a0a0a",
    textColor: "#f6f6f6",
    sections: [
      {
        images: [
          img(
            "/images/projects/metibuy/landing-hero.webp",
            "The Metibuy landing page hero — \"Real makers. Real shops. One marketplace.\" above a rail of products that scrolls on its own",
          ),
          img(
            "/images/projects/metibuy/shop-home.webp",
            "The shop home: a split hero of category promos above the returning-shopper rail",
          ),
        ],
        text: {
          eyebrow: "01 — Problem",
          heading: "Two audiences, one front door.",
          body: "Metibuy has to win two different people at once: a shopper who just wants to buy something, and a seller deciding whether to open a store there. The old front end was one dark theme throughout. I split the landing page: the top half light and full of products, then halfway down it turns black and addresses sellers. The change of colour tells you who the page is talking to before you read a word. The backend was already built: redesign everything people see, break nothing that worked.",
        },
      },
      {
        images: [
          img(
            "/images/projects/metibuy/category-page.webp",
            "The Electronics category page: a filter rail for brand, price, rating and condition beside the new-arrivals grid",
          ),
          img(
            "/images/projects/metibuy/product-page.webp",
            "A product page — gallery, price, colour and storage options, seller, and add to cart",
          ),
        ],
        text: {
          eyebrow: "02 — Details",
          heading: "Redesigning without unplugging.",
          body: "Many pages already pulled live data from the backend. Early on I swapped that for sample data on a couple of them to move faster, and learned that a page can look finished while being quietly disconnected. From then on, pages with live data kept every connection and only the design changed. Pages that weren't connected yet got sample data behind a small adapter, so plugging in real data later is a one-line change.",
        },
      },
      {
        images: [
          img(
            "/images/projects/metibuy/all-categories-phone.webp",
            "The category index on a phone — the desktop's sidebar of ten aisles is now a row of chips pinned under the header, with the columns stacked full-width below it",
          ),
          img(
            "/images/projects/metibuy/product-page-phone.webp",
            "A product page on a phone — gallery, title and seller stacked, with the price and Buy now detached into a bar pinned to the bottom of the screen",
          ),
        ],
        text: {
          eyebrow: "03 — Responsive",
          heading: "Built for the screen most people shop on.",
          body: "Every page had to work on a phone without squeezing the desktop layout into a narrower column. On the category index, the sidebar of ten aisles becomes a row of chips pinned under the header and the three columns stack to full width. On a product page, the buy box that sits beside the gallery on desktop detaches into a bar fixed to the bottom of the screen, so the price and Buy now are always under a thumb. The navigation moves down there too, for the same reason.",
        },
      },
      {
        images: [
          img(
            "/images/projects/metibuy/shop-home-rails.webp",
            "Shop home rails — the category rail stacked above the flash-sale spotlight",
          ),
          img(
            "/images/projects/metibuy/shop-continue.webp",
            "The shop home's \"Continue where you left off\" rail — recently viewed products, each stamped with when it was seen",
          ),
        ],
        text: {
          eyebrow: "04 — Shopping",
          heading: "A store you can keep moving through.",
          body: "The shop home is built from rails: a split hero, a row that picks up where a returning visitor left off, then category rails, a flash-sale spotlight and featured sellers. Category pages share one template driven by a small config, so a new category means writing settings, not building a page. The cart nudges toward free delivery and keeps the order summary pinned beside the items, and on phones a live cart bar follows you down the page.",
        },
      },
      {
        images: [
          img(
            "/images/projects/metibuy/cart-checkout.webp",
            "The cart, with its order summary pinned beside the items, a promo-code field and secure checkout",
          ),
          img(
            "/images/projects/metibuy/admin-dashboard.webp",
            "The admin dashboard — revenue, orders, products and customers, with a revenue chart and top products",
          ),
        ],
        text: {
          eyebrow: "05 — Outcome",
          heading: "Merged, from landing page to admin.",
          body: "Over five weeks, the redesign covered more than 50 pages: the landing page, the shop, product and category pages, cart and checkout, wishlist, account and order tracking, seller registration and payouts, and the admin area. It was merged into the client's main codebase for their team to build on. The lesson I'm keeping: when you redesign someone else's product, the visuals are only half the job. The other half is leaving the code in a state the next person can work with.",
        },
      },
    ],
  },
  playtime: {
    name: "PlayTime",
    tagline: "Game-Time Tracker for Windows",
    description:
      "A Windows app that counts your hours in every game you play, not just the ones Steam knows about. I designed and built the whole product: the desktop app, its design system and the website that sells it.",
    services: [
      "Product Design",
      "Desktop App (Electron + React)",
      "Design System",
      "Landing Page",
    ],
    recognitions: [],
    bgColor: "#0a0a0a",
    textColor: "#f6f6f6",
    caseStudyUrl: "https://playtimeapp.vercel.app",
    sections: [
      {
        images: [
          img(
            "/images/projects/playtime/home-dashboard.webp",
            "PlayTime's home screen, with League of Legends at 211 hours 10 minutes — a game Steam never sees — and the week's sessions down the sidebar",
          ),
          img(
            "/images/projects/playtime/library-grid.webp",
            "The library: 28 games tracked automatically, the installed ones above and the uninstalled ones kept below, every cover matched from Steam",
          ),
        ],
        text: {
          eyebrow: "01 — Problem",
          heading: "Steam only counts Steam.",
          body: "Steam keeps a careful record of your hours, but only for games you launch through Steam. A GOG install, an Xbox game or an old game sitting in a folder leaves no record at all. Most of my library lives in folders, so most of my playtime was going uncounted. I wanted one place that knew about every game I own, and I wanted it to work offline, with no account needed.",
        },
      },
      {
        images: [
          img(
            "/images/projects/playtime/milestones.webp",
            "The milestones screen, which works out from tracked hours alone that one game is finished, five are being played and one is backlog",
          ),
          img(
            "/images/projects/playtime/notifications.webp",
            "The notification panel open over the home screen — a 14-day streak, a new record session and two playtime milestones, all noticed while the app sat in the tray",
          ),
        ],
        text: {
          eyebrow: "02 — Approach",
          heading: "Tracking you never have to touch.",
          body: "The core decision was that tracking had to be automatic. Every few seconds PlayTime checks which programs are running and matches them against your library, so a game launched from anywhere gets counted: no timer to start, no overlay. It lives in the system tray and starts with Windows. That set the bar for the rest of the design. If the app does its main job without ever being opened, every screen has to be worth opening for its own sake.",
        },
      },
      {
        images: [
          img(
            "/images/projects/playtime/folder-scan.webp",
            "A scan of C:\\Games listing what it found, with the Devil May Cry collection split into three separate games by their exe files and anything already tracked greyed out",
          ),
          img(
            "/images/projects/playtime/achievements.webp",
            "The achievements screen with a game expanded: each achievement's icon, name, description, rarity percentage and the date it was unlocked",
          ),
        ],
        text: {
          eyebrow: "03 — Details",
          heading: "A library that fills itself in.",
          body: "Point PlayTime at a folder and it scans everything, skipping installers and bundled tools and splitting collections into separate games. Cover art is matched from Steam automatically, and achievements are read from local save files with names, icons and rarity filled in. It all sits on one design system: a monochrome interface where data is drawn in white and green has one job, showing what went up. Five themes and a custom accent colour sit on top.",
        },
      },
      {
        images: [
          img(
            "/images/projects/playtime/landing-hero.webp",
            "The PlayTime landing page at the top — the headline over a fanned row of game covers",
          ),
          img(
            "/images/projects/playtime/app-on-site.webp",
            "The website's \"This is the actual app\" section, running the real PlayTime interface inside the page rather than a screenshot of it",
          ),
        ],
        text: {
          eyebrow: "04 — Website",
          heading: "The landing page runs the real app.",
          body: "I wanted people to try PlayTime before downloading it, so one section of the website runs the app's actual interface instead of showing screenshots. The components are copied straight from the app, with a stand-in for the parts that normally talk to Windows, and one script brings the site up to date whenever the app changes. The rest of the page is honest about money: tracking is free forever, and the FAQ answers what the paid plan costs and how to cancel it.",
        },
      },
      {
        images: [
          img(
            "/images/projects/playtime/stats.webp",
            "The stats screen over all time: 277 hours 29 minutes across 809 sessions, a 20-minute average, and the per-game breakdown underneath",
          ),
          img(
            "/images/projects/playtime/themes-accent.webp",
            "Settings with the five themes and the custom accent picker open mid-pick, the interface recolouring live behind it",
          ),
        ],
        text: {
          eyebrow: "05 — Outcome",
          heading: "Built, tested, and nearly out the door.",
          body: "PlayTime is at version 0.9.0, after a round of fixes that closed around 45 bugs, and it has tracked my own games since the first build. Payments run through Paddle and work end to end in test; the public launch is next. The lesson was trust. A tracker is only useful if you believe its numbers, so much of the work went into unglamorous parts: saving that survives a crash, sessions that split properly when the PC sleeps, and never showing a number the app isn't sure of.",
        },
      },
    ],
  },
  skeet: {
    name: "Skeet",
    tagline: "Video Editor in the Browser",
    description:
      "Contract work, about two months. Skeet is a video editor that runs in a browser tab — a real timeline, a colour suite, and an assistant called Clive that has already watched your footage. The design was two people: me on UI/UX, and the developer building the app, who covered the rest. The product is his; what follows is the part I worked on, and only that.",
    services: [
      "Contract Project",
      "UI/UX Design",
      "Landing Page",
      "Web App Design",
    ],
    recognitions: [],
    bgColor: "#0a0a0a",
    textColor: "#f6f6f6",
    caseStudyUrl: "https://skeet.now",
    sections: [
      {
        images: [
          img(
            "/images/projects/skeet/landing-hero.webp",
            "The Skeet landing hero — “The studio for the modern creative” over the editor itself, timeline and all",
          ),
          img(
            "/images/projects/skeet/landing-editor.webp",
            "“One editor, open in a browser tab” — the full editing surface shown as one screen",
          ),
        ],
        text: {
          eyebrow: "01 — Problem",
          heading: "A desktop editor, asked to live in a tab.",
          body: "Video editing is desktop software: you install it, it owns your machine, and the project sits on one drive. Skeet's claim is that the studio opens in a browser tab instead, and that everyone you invite lands on the same timeline. That is the design problem — an editor in a tab has seconds to look like it can be trusted with real footage. I was its only dedicated designer, working directly with the person building it, so decisions were settled in the build rather than a handoff document.",
        },
      },
      {
        images: [
          img(
            "/images/projects/skeet/landing-timeline.webp",
            "“One place to cut, grade and finish” — the cut section of the landing page, built around a real screen of the timeline",
          ),
          img(
            "/images/projects/skeet/landing-grade.webp",
            "“Then make it look like something” — the grade section, showing the colour suite rather than describing it",
          ),
        ],
        text: {
          eyebrow: "02 — Landing page",
          heading: "Show the editor, don't describe it.",
          body: "The landing page runs about 9,000px over twelve sections, and the rule it follows is that every claim arrives with the screen that backs it. The cut section shows the timeline. The grade section shows the colour suite. “Together” shows the shared timeline rather than talking about collaboration. A tool this unusual cannot be sold on adjectives — a visitor has to see it working before the price makes sense, which is why the four tiers only appear at the end. My part was the UI/UX across these sections.",
        },
      },
      {
        images: [
          img(
            "/images/projects/skeet/app-studio.webp",
            "Studio with an empty project — footage and search on the left, the viewer over a timeline of V1, A1, V2 and A2 tracks, and the assistant on the right offering to bring footage in",
          ),
          img(
            "/images/projects/skeet/app-schedule.webp",
            "The schedule — October on a month grid with nothing going out, beside an “Up next” rail explaining that a scheduled cut waits there until it goes out",
          ),
        ],
        text: {
          eyebrow: "03 — The studio",
          heading: "What it says before you've made anything.",
          body: "Skeet is not launched yet, so every account starts empty and a blank screen is the first thing anyone sees. That makes the blank states the opposite of an afterthought: each names what will appear there and what to do next. Empty is also where the layout shows — footage left, searchable by spoken word as well as filename, and V1, A1, V2 and A2 under a playhead at 00:00:00:00. The schedule answers the same way: a scheduled cut waits in the rail until it goes out."
        },
      },
      {
        images: [
          img(
            "/images/projects/skeet/app-chat.webp",
            "The same project in Chat — the assistant takes the whole page, the timeline demoted to a small preview card, with a prompt bar along the bottom",
          ),
          img(
            "/images/projects/skeet/app-integrations.webp",
            "The integrations page — YouTube and Google Calendar signed in but still needing permission, above TikTok, Instagram, Twitch and Kick waiting to be connected",
          ),
        ],
        text: {
          eyebrow: "04 — Chat and connections",
          heading: "Say what you want, then send it somewhere.",
          body: "The toggle is the product's real bet: one project, opened either as a timeline or as a conversation. In Chat the assistant takes the page and the timeline shrinks to a preview card — the mirror of Studio. Nothing is hidden; only the emphasis moves, letting one person direct a cut in sentences and another trim it by hand. Connections carry the subtler state: signing in with Google is not the same as granting YouTube access, so the row says so in amber, with the button that fixes it."
        },
      },
    ],
  },
  // Rested on 2026-10-02 so Skeet could take the fourth home slot without
  // leaving the small grid on an odd cell. Still built, still reachable at
  // /projects/vertex-lab; `hidden` only keeps it off the grid and out of the
  // next-case-study chain. Its card is UNLISTED_PROJECTS in lib/home-data.ts.
  "vertex-lab": {
    hidden: true,
    name: "Vertex Lab",
    tagline: "Two-Person Product Studio",
    description:
      "Vertex Lab is a two-person product studio I co-founded. We design and build web and AI products, for clients and for ourselves. I lead design and engineering, and the studio's own website was the first thing I made.",
    services: ["Brand & Web Design", "Next.js Build", "Motion Design"],
    recognitions: [],
    bgColor: "#0a0a0a",
    textColor: "#f6f6f6",
    caseStudyUrl: "https://vertexlab-ai.vercel.app",
    sections: [
      {
        images: [
          img(
            "/images/projects/vertex-lab/home-hero.webp",
            "The Vertex Lab homepage at the top — “A product studio that designs and ships.” over a drawn portrait of the team, with the services rail running along the bottom",
          ),
          img(
            "/images/projects/vertex-lab/founders.webp",
            "The founders block on the about page — Fred Mbewe on growth and partnerships beside Peter Phiri on design and engineering",
          ),
        ],
        text: {
          eyebrow: "01 — Problem",
          heading: "A new studio with nothing to point at yet.",
          body: "Vertex Lab started in 2026 with two founders: Fred, who finds partners and clients, and me, who designs and builds. For a studio, the website is the first piece of work anyone sees, and people judge the craft before they read a word. It had to say what we do in a few seconds, show how we work, and give Fred a link he could send to anyone, all before we had a long list of client projects to show.",
        },
      },
      {
        images: [
          img(
            "/images/projects/vertex-lab/homepage-full-length.webp",
            "The whole homepage stood up as one object in three slices — cream hero, white body, the black selected-work band and the black call to action, with emerald the only colour in any of them",
          ),
          img(
            "/images/projects/vertex-lab/services-grid.webp",
            "The services page: the four things the studio builds — web and product design, AI products, full-stack build, desktop and apps — each with what you get listed beside it",
          ),
        ],
        text: {
          eyebrow: "02 — Approach",
          heading: "Monochrome, with one colour that means something.",
          body: "I built the site light, tried a dark version for a week, and came back to light because the dark one didn't feel like us. The homepage is strictly black, grey and white. The only colour is a deep emerald, kept for the headline, the buttons and the call to action, so your eye always knows where to go. That meant going back and taking the colour out of diagrams and illustrations that had it. Emerald was chosen on purpose: most studio sites are black, white and blue.",
        },
      },
      {
        images: [
          img(
            "/images/projects/vertex-lab/process-diagram.webp",
            "The process diagram with the Discover stage hovered, its path lit emerald back to the studio mark at the centre",
          ),
          img(
            "/images/projects/vertex-lab/selected-work-dark.webp",
            "The dark selected-work section — CreatorFlow, Stilly, PlayTime and Metibuy arranged around the studio mark",
          ),
        ],
        text: {
          eyebrow: "03 — Details",
          heading: "Motion that guides the eye.",
          body: "The motion is built with GSAP and Lenis smooth scrolling. Headlines rise in word by word, numbers count up, and the “How we work” section draws itself in as you reach it. Our process is a diagram: six stages around your product, and hovering one lights up its path. When you scroll into the dark section, the page gently carries you the rest of the way in, and it never pulls you when you scroll back up.",
        },
      },
      {
        images: [
          img(
            "/images/projects/vertex-lab/work-index.webp",
            "The work index — CreatorFlow, Stilly and PlayTime as product cards, with the client work section beginning underneath",
          ),
          img(
            "/images/projects/vertex-lab/journal-index.webp",
            "The journal index — three posts, each with its category, date and reading time",
          ),
        ],
        text: {
          eyebrow: "04 — Outcome",
          heading: "Live, and easy to keep current.",
          body: "The site is live, with seven kinds of page: home, work and case studies, services, products, about, a journal and contact. Every piece of content lives in plain data files, separate from the layout, so adding a project or a journal post means editing a list, not a page. It took about three months. The lesson I kept: an accent colour only works if you're strict about it. The moment it shows up everywhere, it stops pointing anywhere.",
        },
      },
    ],
  },

};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = projects[slug];
  if (!project) return {};
  const title = `${project.name}: ${project.tagline}`;
  const description =
    project.description.length > 160
      ? `${project.description.slice(0, 157).trimEnd()}…`
      : project.description;
  return {
    title,
    description,
    openGraph: { title, description, url: `/projects/${slug}` },
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = projects[slug];
  if (!project) notFound();

  // Cycle to the next case study in the order defined in `projects`, skipping
  // the hidden ones. A hidden case study is not in the cycle itself, so it
  // hands over to the first listed project instead of its neighbour.
  const slugs = Object.keys(projects).filter((s) => !projects[s].hidden);
  const currentIndex = slugs.indexOf(slug);
  const nextSlug =
    currentIndex === -1 ? slugs[0] : slugs[(currentIndex + 1) % slugs.length];
  const nextProject = projects[nextSlug];

  return (
    <main
      data-cursor-theme="light"
      className="relative isolate min-h-screen"
      style={{
        // Base tint under the texture, and while the image loads.
        backgroundColor: project.bgColor,
        color: project.textColor,
      }}
    >
      {/* Per-project texture behind the whole case study, knocked back by an
          80% black overlay so it reads as tone rather than imagery. It's its
          own fixed layer rather than background-attachment: fixed, which
          repaints the whole screen on every scroll frame. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url('${
            project.bgImage ?? CASE_STUDY_BG_FALLBACK
          }')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          willChange: "transform",
        }}
      />
      <ProjectNav />

      <ProjectRibbon
        slug={slug}
        name={project.name}
        description={project.description}
        services={project.services}
        recognitions={project.recognitions}
        bgColor={project.bgColor}
        textColor={project.textColor}
        caseStudyUrl={project.caseStudyUrl}
        githubUrl={project.githubUrl}
        pdfUrl={project.pdfUrl}
        sections={project.sections}
        next={{
          slug: nextSlug,
          name: nextProject.name,
          bgColor: nextProject.bgColor,
          bgImage: nextProject.bgImage ?? CASE_STUDY_BG_FALLBACK,
        }}
      />
    </main>
  );
}

export function generateStaticParams() {
  return Object.keys(projects).map((slug) => ({ slug }));
}
