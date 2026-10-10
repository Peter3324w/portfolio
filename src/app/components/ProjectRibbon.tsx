"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import BlurReveal from "./animations/BlurReveal";
import { getLenis } from "../lib/lenis";
import { setPendingReturn } from "../lib/cameraPush";
import {
  HANDOVER,
  clearHandoverArrival,
  peekHandoverArrival,
  type HandoverDetail,
} from "../lib/handover";
import {
  CASE_TITLE_CLASS,
  NEXT_PANEL_BG,
  NEXT_PANEL_INK,
  NEXT_PANEL_WIDTH,
  NEXT_TITLE_GREY,
  NextPanelDecor,
} from "./NextPanel";

export type CaseStudyImage =
  | { type: "image"; src: string; alt?: string }
  | { type: "placeholder"; label?: string };

export type CaseStudySection = {
  images: [CaseStudyImage, CaseStudyImage];
  text: {
    eyebrow?: string;
    heading: string;
    body: string;
  };
};

export type NextProject = {
  slug: string;
  name: string;
  bgColor: string;
  // The texture its page sits on; the hand-over layer turns into it.
  bgImage: string;
};

type Props = {
  // This case study's own slug: going back home pulls the camera out of it.
  slug?: string;
  name: string;
  description: string;
  services: string[];
  recognitions: string[];
  bgColor: string;
  textColor: string;
  caseStudyUrl?: string;
  githubUrl?: string;
  pdfUrl?: string;
  sections: CaseStudySection[];
  next?: NextProject;
};

// Media sizes after lusion.co: every image is as tall as the band between the
// header and the progress bar (the screen height minus 262px, which is 638px
// on a 1440×900 screen), 16:9 wide, 20px corners, 80px apart.
const ITEM_H = "clamp(360px, calc(100vh - 262px), 1000px)";
const ITEM_W = `calc(${ITEM_H} * 16 / 9)`;
const ITEM_GAP = 80;
const IMAGE_RADIUS = 20;
const INTRO_WIDTH = 520;
const TEXT_WIDTH = 640;
// Horizontal pixels travelled per pixel scrolled. The ribbon's scroll length
// is derived from its real width, so bigger media don't make it race.
const SCROLL_PACE = 1.4;
// How far the end panel leans in as the next-project meter fills.
const NEXT_PANEL_LEAN = 56;

export default function ProjectRibbon({
  slug,
  name,
  description,
  services,
  recognitions,
  bgColor,
  textColor,
  caseStudyUrl,
  githubUrl,
  pdfUrl,
  sections,
  next,
}: Props) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLButtonElement>(null);
  const panelTitleRef = useRef<HTMLSpanElement>(null);
  const hintRef = useRef<HTMLSpanElement>(null);
  const introTitleRef = useRef<HTMLHeadingElement>(null);
  const handOverRef = useRef<() => void>(() => {});

  // Arriving through a hand-over: the page starts in the take-over layer's
  // last frame (title where the layer left it, everything else hidden), then
  // the title glides home and the rest comes in behind it.
  const [arrival] = useState(() => peekHandoverArrival());
  const router = useRouter();
  const nextHref = next ? `/projects/${next.slug}` : null;

  // Fetch the next case study ahead of time, so the take-over layer barely
  // has to hold its last frame while the route loads.
  useEffect(() => {
    if (nextHref) router.prefetch(nextHref);
  }, [router, nextHref]);

  // Going back home plays the camera push in reverse (see useCameraPush). A
  // plain click on any link to the home page (the logo, Home, Projects) first
  // fades this page to its bare ground, then navigates. Every other way home,
  // the browser's Back included, is caught as this page unmounts: a layout
  // cleanup runs before the home page's layout effect reads the return, which
  // a popstate listener can't promise.
  useLayoutEffect(() => {
    if (!slug) return;
    return () => {
      if (window.location.pathname === "/") setPendingReturn(slug);
    };
  }, [slug]);
  useEffect(() => {
    if (!slug) return;
    let leaving = false;
    const onClick = (e: MouseEvent) => {
      if (
        leaving ||
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }
      const link = (e.target as Element | null)?.closest?.('a[href="/"]');
      if (!link) return;
      // Capture phase, ahead of the Link's own handler, so it can't navigate
      // before the fade.
      e.preventDefault();
      e.stopPropagation();
      leaving = true;
      getLenis()?.stop();
      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      const fade = reduced ? 0 : 350;
      const section = sectionRef.current;
      if (section) {
        section.style.transition = `opacity ${fade}ms ease`;
        section.style.opacity = "0";
      }
      setPendingReturn(slug);
      window.setTimeout(() => router.push("/", { scroll: false }), fade + 10);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [slug, router]);
  // Every visit starts with the media held back, so a refresh or a direct
  // link gets the same entrance as a transition: the ground, the intro
  // blurring in, the media sliding in behind it.
  const [phase, setPhase] = useState<"arriving" | "entering" | "idle">(
    "arriving"
  );

  useLayoutEffect(() => {
    if (!arrival) return;
    // Start at the top of the ribbon, before the scroll handler first runs.
    window.scrollTo(0, 0);
    getLenis()?.scrollTo(0, { immediate: true, force: true });
    // A hand-over left the title on screen: start it exactly there. (A camera
    // push leaves the bare ground; the intro blurs in on its own.)
    const title =
      arrival.kind === "handover" ? introTitleRef.current : null;
    if (title && arrival.kind === "handover") {
      // Clear any offset first: in development React runs this twice.
      title.style.transition = "none";
      title.style.transform = "";
      const r = title.getBoundingClientRect();
      title.style.transform = `translate(${(arrival.titleX - r.left).toFixed(2)}px, ${(arrival.titleY - r.top).toFixed(2)}px)`;
    }
    clearHandoverArrival();

    let raf = requestAnimationFrame(() => {
      raf = requestAnimationFrame(() =>
        window.dispatchEvent(new CustomEvent("project:handoverReady"))
      );
    });
    let timer = 0;
    const onDone = () => {
      const lenis = getLenis();
      lenis?.scrollTo(0, { immediate: true, force: true });
      lenis?.start();
      if (title) {
        title.style.transition = `transform ${HANDOVER.enter}ms cubic-bezier(0.87, 0, 0.13, 1)`;
        title.style.transform = "";
      }
      setPhase("entering");
      timer = window.setTimeout(() => setPhase("idle"), HANDOVER.enter + 1400);
    };
    window.addEventListener("project:handoverDone", onDone, { once: true });
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
      window.removeEventListener("project:handoverDone", onDone);
    };
  }, [arrival]);

  // No transition to wait for (a refresh, a direct link): enter once the
  // held-back first frame has painted.
  useEffect(() => {
    if (arrival) return;
    let timer = 0;
    let raf = requestAnimationFrame(() => {
      raf = requestAnimationFrame(() => {
        setPhase("entering");
        timer = window.setTimeout(() => setPhase("idle"), HANDOVER.enter + 1400);
      });
    });
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
    };
  }, [arrival]);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    // Image-tile pop-up: mirrors the landing page ProjectCard intro — as a
    // tile enters the viewport from the right, it unfolds from a tilted,
    // scaled-down, clip-pathed state into its resting form.
    //
    // The shot inside no longer zooms. It used to ride scale 1.4 → 1 across
    // the tile's WHOLE horizontal travel, so a picture only reached its true
    // size as it was leaving the screen — which made it unreadable for the
    // 90% of the pass before that. The inner wrapper is kept as a plain
    // static layer, so putting the zoom back is a matter of writing to it.
    const POPUP_TRIGGER = 250;
    const MAX_TILT_X = 8;
    const MAX_TILT_Y = 3;
    const MIN_SCALE = 0.92;
    // Ghost-writer fill: words fade in, staggered in reading order over
    // ~2.5s, once a text tile's left edge reaches the right third of the
    // screen. Early enough that fast scrollers still see it move.
    const ANIM_DURATION_MS = 2500;
    const WORD_TRANSITION_MS = 240;

    type Popup = {
      el: HTMLElement;
      inner: HTMLElement;
      left: number;
      width: number;
      tiltSign: number;
      waiting: boolean;
    };
    type Fill = {
      el: HTMLElement;
      left: number;
      words: HTMLElement[];
      filled: boolean;
    };

    // Geometry is measured here, not read back every frame. offsetLeft
    // ignores the track's transform, so a tile's place on screen is just its
    // offset plus the track's current shift: the scroll handler only writes.
    let popups: Popup[] = [];
    let fills: Fill[] = [];
    let maxTranslate = 0;
    let trackLeft = 0;

    const measure = () => {
      const container = track.parentElement;
      // The ribbon's length from layout, not scrollWidth: scrollWidth counts
      // transforms too, so measuring while the media wait off to the right
      // (the entrance) made the ribbon overshoot and stop short of the edge.
      const last = track.lastElementChild as HTMLElement | null;
      const end = last
        ? last.offsetLeft +
          last.offsetWidth +
          (parseFloat(getComputedStyle(last).marginRight) || 0) +
          (parseFloat(getComputedStyle(track).paddingRight) || 0)
        : 0;
      maxTranslate = Math.max(0, end - (container?.clientWidth ?? 0));
      // Desktop scrolls the ribbon sideways for as long as it is wide; phones
      // stack it, so the section takes its natural height there.
      section.style.height =
        window.innerWidth >= 768
          ? `${Math.round(window.innerHeight + maxTranslate / SCROLL_PACE)}px`
          : "";
      trackLeft = container?.getBoundingClientRect().left ?? 0;
      popups = Array.from(
        track.querySelectorAll<HTMLElement>("[data-popup-card]")
      ).flatMap((el) => {
        const inner = el.querySelector<HTMLElement>("[data-popup-inner]");
        if (!inner) return [];
        return [
          {
            el,
            inner,
            left: el.offsetLeft,
            width: el.offsetWidth,
            tiltSign: el.dataset.popupSide === "right" ? -1 : 1,
            waiting: false,
          },
        ];
      });
      const wasFilled = new Set(fills.filter((f) => f.filled).map((f) => f.el));
      fills = Array.from(
        track.querySelectorAll<HTMLElement>("[data-fill-tile]")
      ).map((el) => ({
        el,
        left: el.offsetLeft,
        words: Array.from(el.querySelectorAll<HTMLElement>("[data-fill-word]")),
        filled: wasFilled.has(el),
      }));
    };

    // Stagger each tile's words across the fill, in DOM (reading) order.
    // CSS does the staggering; the scroll handler flips them all at once.
    const assignDelays = () => {
      const span = Math.max(1, ANIM_DURATION_MS - WORD_TRANSITION_MS);
      for (const fill of fills) {
        const n = fill.words.length;
        fill.words.forEach((word, i) => {
          word.style.transitionDelay = `${n <= 1 ? 0 : (i / (n - 1)) * span}ms`;
        });
      }
    };

    // Words are promoted to their own layers only while their tile fades,
    // so the fade runs on the compositor instead of repainting the tile every
    // frame, and the layers are handed back once the text has settled.
    const timers: number[] = [];
    const startFill = (fill: Fill) => {
      for (const word of fill.words) word.style.willChange = "opacity";
      requestAnimationFrame(() => {
        for (const word of fill.words) word.style.opacity = "1";
        timers.push(
          window.setTimeout(() => {
            for (const word of fill.words) word.style.willChange = "";
          }, ANIM_DURATION_MS + WORD_TRANSITION_MS + 200)
        );
      });
    };

    let ticking = false;
    let atEnd = false;
    const update = () => {
      ticking = false;
      const bar = progressBarRef.current;

      // Horizontal scroll is desktop-only.
      if (window.innerWidth < 768) {
        track.style.transform = "";
        if (bar) bar.style.transform = "scaleX(0)";
        atEnd = false;
        return;
      }

      const rect = section.getBoundingClientRect();
      const total = section.offsetHeight - window.innerHeight;
      if (total <= 0) return;
      const progress = Math.min(1, Math.max(0, -rect.top / total));
      atEnd = progress > 0.999;
      const shift = -progress * maxTranslate;
      track.style.transform = `translate3d(${shift}px, 0, 0)`;
      if (bar) bar.style.transform = `scaleX(${progress})`;

      const vw = window.innerWidth;

      for (const tile of popups) {
        const left = trackLeft + tile.left + shift;
        if (left > vw) {
          // Still off to the right: park it folded, once.
          if (!tile.waiting) {
            tile.waiting = true;
            tile.el.style.transform = `perspective(800px) rotateX(${MAX_TILT_X}deg) rotateY(${MAX_TILT_Y * tile.tiltSign}deg) scale(${MIN_SCALE})`;
            tile.el.style.clipPath = `inset(30% 0 30% 0 round ${IMAGE_RADIUS}px)`;
          }
          continue;
        }
        // Already scrolled past on the left: nothing on screen to update.
        if (left + tile.width < 0) continue;
        tile.waiting = false;

        const enter = Math.min(1, Math.max(0, (vw - left) / POPUP_TRIGGER));
        const tiltX = MAX_TILT_X * (1 - enter);
        const tiltY = MAX_TILT_Y * tile.tiltSign * (1 - enter);
        const scale = MIN_SCALE + (1 - MIN_SCALE) * enter;
        const clip = 30 * (1 - enter);
        tile.el.style.transform = `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(${scale})`;
        tile.el.style.clipPath = `inset(${clip}% 0 ${clip}% 0 round ${IMAGE_RADIUS}px)`;
      }

      const trigger = vw * 0.7;
      for (const fill of fills) {
        if (fill.filled || trackLeft + fill.left + shift >= trigger) continue;
        fill.filled = true;
        startFill(fill);
      }
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    const onResize = () => {
      measure();
      onScroll();
    };

    // Next-project meter: keep scrolling at the end of the ribbon and it
    // fills; stop and it drains. Full hands over to the next case study.
    let meter = 0;
    let lastInput = 0;
    let meterRaf = 0;
    let handingOver = false;
    const renderMeter = () => {
      const panel = panelRef.current;
      if (!panel) return;
      panel.style.setProperty("--fill", meter.toFixed(3));
      // The panel leans in as it fills, so the input feels physical. Its
      // tail (see NextTile) keeps it flush with the right edge meanwhile.
      panel.style.transform =
        meter > 0
          ? `translate3d(${(-meter * NEXT_PANEL_LEAN).toFixed(1)}px, 0, 0)`
          : "";
      if (hintRef.current) {
        hintRef.current.style.opacity = String(1 - Math.min(1, meter * 3));
      }
    };
    const handOver = () => {
      const panel = panelRef.current;
      const title = panelTitleRef.current;
      if (handingOver || !next || !panel || !title) return;
      handingOver = true;
      cancelAnimationFrame(meterRaf);
      getLenis()?.stop();
      const pr = panel.getBoundingClientRect();
      const tr = title.getBoundingClientRect();
      const padLeft = parseFloat(getComputedStyle(track).paddingLeft) || 0;
      const detail: HandoverDetail = {
        href: `/projects/${next.slug}`,
        name: next.name,
        panelLeft: pr.left,
        panelWidth: pr.width,
        titleFrom: { x: tr.left, y: tr.top },
        // Where the next page's title starts: its own left edge, centred.
        titleTo: { x: padLeft, y: (window.innerHeight - tr.height) / 2 },
        bgColor: next.bgColor,
        bgImage: next.bgImage,
        textColor,
      };
      // This page fades as the panel covers it.
      track.style.transition = `opacity ${Math.round(HANDOVER.expand * 0.6)}ms linear`;
      track.style.opacity = "0.1";
      window.dispatchEvent(new CustomEvent("project:handover", { detail }));
    };
    handOverRef.current = handOver;
    const tickMeter = (now: number) => {
      meterRaf = 0;
      if (handingOver) return;
      const idle = now - lastInput > 140;
      if (idle && meter > 0) meter = Math.max(0, meter - HANDOVER.drain / 60);
      renderMeter();
      if (meter >= 1) {
        handOver();
        return;
      }
      if (meter > 0 || !idle) meterRaf = requestAnimationFrame(tickMeter);
    };
    const feed = (amount: number) => {
      if (handingOver || !atEnd || !next) return;
      meter = Math.min(1, meter + amount);
      lastInput = performance.now();
      if (!meterRaf) meterRaf = requestAnimationFrame(tickMeter);
    };
    const onWheel = (e: WheelEvent) => {
      if (e.deltaY > 0) feed(e.deltaY / HANDOVER.fill);
    };
    let touchY: number | null = null;
    const onTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0]?.clientY ?? null;
    };
    const onTouchMove = (e: TouchEvent) => {
      const y = e.touches[0]?.clientY;
      if (touchY == null || y == null) return;
      const dy = touchY - y;
      touchY = y;
      if (dy > 0) feed((dy * 1.6) / HANDOVER.fill);
    };
    const onKey = (e: KeyboardEvent) => {
      if (["ArrowDown", "PageDown", " ", "End"].includes(e.key)) feed(0.34);
    };

    measure();
    assignDelays();
    update();
    // Web fonts change the text tiles' widths, so measure again once loaded.
    let disposed = false;
    document.fonts?.ready.then(() => {
      if (disposed) return;
      measure();
      update();
    });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("keydown", onKey);

    return () => {
      disposed = true;
      timers.forEach((t) => window.clearTimeout(t));
      cancelAnimationFrame(meterRaf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKey);
    };
    // The case study's own props don't change while it's mounted.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const metaTextSecondary = `${textColor}b3`;
  const metaTextMuted = `${textColor}80`;

  // While arriving, everything after the intro waits off to the right; once
  // the title starts its glide it slides in, one tile after another. Uses
  // the `translate` property so it never fights the tiles' own transforms.
  let arriveOrder = 0;
  const arriveStyle = (): React.CSSProperties | undefined => {
    const i = arriveOrder++;
    if (phase === "idle") return undefined;
    if (phase === "arriving") {
      return { opacity: 0, translate: "18vw 0", transition: "none" };
    }
    const delay = Math.round(HANDOVER.enter * 0.45 + i * 90);
    return {
      opacity: 1,
      translate: "0 0",
      transition: `opacity 1s ease ${delay}ms, translate 1.1s cubic-bezier(0.23, 1, 0.32, 1) ${delay}ms`,
    };
  };

  return (
    <section
      ref={sectionRef}
      className="relative"
      style={{
        // Transparent so the page's background texture (image + 80% black
        // overlay, set on <main>) shows through the full ribbon.
        backgroundColor: "transparent",
        color: textColor,
      }}
    >
      {/* ── DESKTOP: pinned viewport with horizontal ribbon ─────────────── */}
      <div className="hidden md:block sticky top-0 h-screen w-full overflow-hidden">
        <div
          ref={trackRef}
          className="absolute top-1/2 -translate-y-1/2 left-0 flex items-center will-change-transform"
          style={{ paddingLeft: "6vw", paddingRight: "12vw", gap: ITEM_GAP }}
        >
          <IntroTile
            name={name}
            description={description}
            services={services}
            recognitions={recognitions}
            caseStudyUrl={caseStudyUrl}
            githubUrl={githubUrl}
            pdfUrl={pdfUrl}
            bgColor={bgColor}
            textColor={textColor}
            metaTextMuted={metaTextMuted}
            metaTextSecondary={metaTextSecondary}
            titleRef={introTitleRef}
            arriving={arrival?.kind === "handover"}
          />

          {sections.map((section, i) => (
            <React.Fragment key={i}>
              <TextTile
                eyebrow={section.text.eyebrow}
                heading={section.text.heading}
                body={section.text.body}
                metaTextMuted={metaTextMuted}
                metaTextSecondary={metaTextSecondary}
                style={arriveStyle()}
              />
              <Tile
                img={section.images[0]}
                textColor={textColor}
                side="left"
                style={arriveStyle()}
              />
              <Tile
                img={section.images[1]}
                textColor={textColor}
                side="right"
                style={arriveStyle()}
              />
            </React.Fragment>
          ))}

          {next && (
            <NextTile
              next={next}
              panelRef={panelRef}
              titleRef={panelTitleRef}
              hintRef={hintRef}
              onActivate={() => handOverRef.current()}
              style={arriveStyle()}
            />
          )}
        </div>

        {/* Scroll progress bar + label, centered with a 4px gap between. */}
        <div
          className="absolute bottom-6 left-0 right-0 flex flex-col items-center gap-1"
          style={
            phase === "idle"
              ? undefined
              : {
                  opacity: phase === "arriving" ? 0 : 1,
                  transition:
                    phase === "entering"
                      ? `opacity 0.6s ease ${HANDOVER.enter}ms`
                      : "none",
                }
          }
        >
          <div
            className="h-[1px]"
            style={{
              width: 600,
              backgroundColor: `${textColor}20`,
            }}
          >
            <div
              ref={progressBarRef}
              className="h-full origin-left will-change-transform"
              style={{ backgroundColor: textColor, transform: "scaleX(0)" }}
            />
          </div>
          <p
            className="uppercase tracking-[0.2em] text-[11px]"
            style={{ color: metaTextMuted }}
          >
            Scroll to explore
          </p>
        </div>
      </div>

      {/* ── MOBILE: vertical stack ──────────────────────────────────────── */}
      <div className="md:hidden flex flex-col gap-12 px-6 py-24">
        <div>
          <p
            className="uppercase tracking-[0.2em] text-[11px] mb-4"
            style={{ color: metaTextMuted }}
          >
            Case Study
          </p>
          <h1 className="text-[44px] leading-[0.95] font-normal mb-6">
            {name}
          </h1>
          <p
            className="text-[18px] leading-[1.55]"
            style={{ color: metaTextSecondary }}
          >
            {description}
          </p>
        </div>

        {sections.map((section, i) => (
          <React.Fragment key={i}>
            <div>
              {section.text.eyebrow && (
                <p
                  className="uppercase tracking-[0.2em] text-[11px] mb-3"
                  style={{ color: metaTextMuted }}
                >
                  {section.text.eyebrow}
                </p>
              )}
              <h3 className="text-[28px] leading-[1.15] font-normal mb-4">
                {section.text.heading}
              </h3>
              <p
                className="text-[18px] leading-[1.6]"
                style={{ color: metaTextSecondary }}
              >
                {section.text.body}
              </p>
            </div>
            <MobileTile img={section.images[0]} textColor={textColor} />
            <MobileTile img={section.images[1]} textColor={textColor} />
          </React.Fragment>
        ))}

        {services.length > 0 && (
          <div>
            <p
              className="uppercase tracking-[0.2em] text-[11px] mb-3"
              style={{ color: metaTextMuted }}
            >
              Services
            </p>
            <ul className="space-y-1 text-[14px]">
              {services.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        )}

        {recognitions.length > 0 && (
          <div>
            <p
              className="uppercase tracking-[0.2em] text-[11px] mb-3"
              style={{ color: metaTextMuted }}
            >
              Recognitions
            </p>
            <ul className="space-y-1 text-[14px]">
              {recognitions.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="self-start">
          <ProjectActions
            caseStudyUrl={caseStudyUrl}
            githubUrl={githubUrl}
            pdfUrl={pdfUrl}
            bgColor={bgColor}
            textColor={textColor}
          />
        </div>
      </div>
    </section>
  );
}

function IntroTile({
  name,
  description,
  services,
  recognitions,
  caseStudyUrl,
  githubUrl,
  pdfUrl,
  bgColor,
  textColor,
  metaTextMuted,
  metaTextSecondary,
  titleRef,
  arriving,
}: {
  name: string;
  description: string;
  services: string[];
  recognitions: string[];
  caseStudyUrl?: string;
  githubUrl?: string;
  pdfUrl?: string;
  bgColor: string;
  textColor: string;
  metaTextMuted: string;
  metaTextSecondary: string;
  titleRef: React.Ref<HTMLHeadingElement>;
  arriving: boolean;
}) {
  const title = (
    <h1 ref={titleRef} className={CASE_TITLE_CLASS}>
      {name}
    </h1>
  );
  return (
    <div
      className="shrink-0 flex flex-col justify-center gap-8"
      style={{ width: INTRO_WIDTH, height: ITEM_H, marginRight: ITEM_GAP }}
    >
      <div>
        <BlurReveal delay={0.5} className="mb-4">
          <p
            className="uppercase tracking-[0.2em] text-[11px]"
            style={{ color: metaTextMuted }}
          >
            Case Study
          </p>
        </BlurReveal>
        {/* Arriving through a hand-over, the title is already on screen (it
            was the layer's title), so it doesn't blur in. */}
        {arriving ? (
          <div className="mb-6">{title}</div>
        ) : (
          <BlurReveal delay={0.65} className="mb-6">
            {title}
          </BlurReveal>
        )}
        <BlurReveal delay={0.8}>
          <p
            className="text-[18px] leading-[1.55]"
            style={{ color: metaTextSecondary }}
          >
            {description}
          </p>
        </BlurReveal>
      </div>

      {services.length > 0 && (
        <BlurReveal delay={0.95}>
          <p
            className="uppercase tracking-[0.2em] text-[11px] mb-3"
            style={{ color: metaTextMuted }}
          >
            Services
          </p>
          <ul className="space-y-1 text-[14px]">
            {services.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </BlurReveal>
      )}

      {recognitions.length > 0 && (
        <BlurReveal delay={1.1}>
          <p
            className="uppercase tracking-[0.2em] text-[11px] mb-3"
            style={{ color: metaTextMuted }}
          >
            Recognitions
          </p>
          <ul className="space-y-1 text-[14px]">
            {recognitions.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </BlurReveal>
      )}

      <BlurReveal delay={1.25} className="self-start">
        <ProjectActions
          caseStudyUrl={caseStudyUrl}
          githubUrl={githubUrl}
          pdfUrl={pdfUrl}
          bgColor={bgColor}
          textColor={textColor}
        />
      </BlurReveal>
    </div>
  );
}

// Launch project, then the optional GitHub and PDF icons. Launch is always
// there; a project with nothing live to open shows it dimmed and inert until
// it has a URL.
function ProjectActions({
  caseStudyUrl,
  githubUrl,
  pdfUrl,
  bgColor,
  textColor,
}: {
  caseStudyUrl?: string;
  githubUrl?: string;
  pdfUrl?: string;
  bgColor: string;
  textColor: string;
}) {
  const launchClass =
    "inline-flex items-center gap-3 px-6 py-3 rounded-full text-[13px] uppercase tracking-wider";
  return (
    <div className="flex items-center gap-3">
      {caseStudyUrl ? (
        <HoverFillPill
          href={caseStudyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={launchClass}
          borderColor={textColor}
          fillColor={textColor}
          fillTextColor={bgColor}
        >
          Launch project
          <LaunchArrow />
        </HoverFillPill>
      ) : (
        <span
          role="link"
          aria-disabled="true"
          title="The live site isn't up yet"
          className={`${launchClass} border select-none`}
          style={{ borderColor: `${textColor}40`, color: `${textColor}66` }}
        >
          Launch project
          <LaunchArrow />
        </span>
      )}

      {githubUrl && (
        <HoverFillPill
          href={githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          ariaLabel="View source on GitHub"
          className="inline-flex items-center justify-center w-11 h-11 rounded-full"
          borderColor={textColor}
          fillColor={textColor}
          fillTextColor={bgColor}
        >
          <GitHubIcon />
        </HoverFillPill>
      )}

      {pdfUrl && (
        <HoverFillPill
          href={pdfUrl}
          download
          ariaLabel="Download full case study PDF"
          className="inline-flex items-center justify-center w-11 h-11 rounded-full"
          borderColor={textColor}
          fillColor={textColor}
          fillTextColor={bgColor}
        >
          <DownloadIcon />
        </HoverFillPill>
      )}
    </div>
  );
}

function Tile({
  img,
  textColor,
  side,
  style,
}: {
  img: CaseStudyImage;
  textColor: string;
  side: "left" | "right";
  style?: React.CSSProperties;
}) {
  return (
    <div
      data-popup-card
      data-popup-side={side}
      className="shrink-0 relative overflow-hidden"
      style={{
        width: ITEM_W,
        height: ITEM_H,
        borderRadius: IMAGE_RADIUS,
        backgroundColor: `${textColor}10`,
        transformOrigin: "center bottom",
        // No CSS transitions here: the scroll handler sets these every
        // frame, and a transition restarting on every write only makes the
        // tile lag behind the scroll.
        willChange: "transform",
        ...style,
      }}
    >
      <div
        data-popup-inner
        className="absolute inset-0"
      >
      {img.type === "image" ? (
        <Image
          src={img.src}
          alt={img.alt ?? ""}
          fill
          className="object-cover"
          // The tile is ITEM_W wide (up to 1778px) AND its inner layer is
          // magnified to 1.4x on the way in, so the image is painted at up to
          // ~2500px. Asking for 1200 made next/image serve a file it then had
          // to stretch past 2x, which is what read as "not HD".
          sizes="(min-width: 768px) 2560px, 100vw"
          quality={90}
        />
      ) : (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ color: `${textColor}55` }}
        >
          <span className="text-[11px] uppercase tracking-[0.25em]">
            {img.label ?? "Media"}
          </span>
        </div>
      )}
      </div>
    </div>
  );
}

function TextTile({
  eyebrow,
  heading,
  body,
  metaTextMuted,
  metaTextSecondary,
  style,
}: {
  eyebrow?: string;
  heading: string;
  body: string;
  metaTextMuted: string;
  metaTextSecondary: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      data-fill-tile
      className="shrink-0 flex flex-col justify-center px-10"
      style={{ width: TEXT_WIDTH, height: ITEM_H, ...style }}
    >
      {eyebrow && (
        <p
          className="uppercase tracking-[0.25em] text-[11px] mb-5"
          style={{ color: metaTextMuted }}
        >
          {eyebrow}
        </p>
      )}
      <h3 className="text-[36px] leading-[1.1] font-normal tracking-[-0.01em] mb-5">
        <ScrollFillText text={heading} />
      </h3>
      <p
        className="text-[18px] leading-[1.6]"
        style={{ color: metaTextSecondary }}
      >
        <ScrollFillText text={body} />
      </p>
    </div>
  );
}

function MobileTile({
  img,
  textColor,
}: {
  img: CaseStudyImage;
  textColor: string;
}) {
  return (
    <div
      className="relative overflow-hidden w-full"
      style={{
        aspectRatio: "4 / 3",
        borderRadius: 16,
        backgroundColor: `${textColor}10`,
      }}
    >
      {img.type === "image" ? (
        <Image
          src={img.src}
          alt={img.alt ?? ""}
          fill
          className="object-cover"
          sizes="100vw"
        />
      ) : (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ color: `${textColor}55` }}
        >
          <span className="text-[11px] uppercase tracking-[0.25em]">
            {img.label ?? "Media"}
          </span>
        </div>
      )}
    </div>
  );
}

// Splits a string into per-word spans that the scroll handler in
// ProjectRibbon fades in, staggered in reading order. Words, not letters: a
// few hundred plain spans instead of thousands, and none of them asks for a
// compositor layer of its own (which is what made these pages stutter).
function ScrollFillText({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\s+)/).map((part, i) =>
        part === "" || /^\s+$/.test(part) ? (
          <React.Fragment key={i}>{part}</React.Fragment>
        ) : (
          <span
            key={i}
            data-fill-word
            style={{ opacity: 0.2, transition: "opacity 240ms ease-out" }}
          >
            {part}
          </span>
        )
      )}
    </>
  );
}

// The next project's panel, sitting against the right edge at the end of the
// ribbon. Keep scrolling and its meter fills; full (or a click) hands over to
// that case study. Its title is the same size as the intro's, so it can
// become the next page's title without changing size.
function NextTile({
  next,
  panelRef,
  titleRef,
  hintRef,
  onActivate,
  style,
}: {
  next: NextProject;
  panelRef: React.Ref<HTMLButtonElement>;
  titleRef: React.Ref<HTMLSpanElement>;
  hintRef: React.Ref<HTMLSpanElement>;
  onActivate: () => void;
  style?: React.CSSProperties;
}) {
  return (
    <button
      ref={panelRef}
      type="button"
      onClick={onActivate}
      aria-label={`Next case study: ${next.name}`}
      data-next-tile-panel
      data-cursor-theme="dark"
      className="shrink-0 relative overflow-hidden text-left cursor-none focus-visible:outline-2 focus-visible:-outline-offset-8 focus-visible:outline-[#536dfe]"
      style={{
        width: NEXT_PANEL_WIDTH,
        height: "100vh",
        backgroundColor: NEXT_PANEL_BG,
        color: NEXT_PANEL_INK,
        // Cancel the track's paddingRight (12vw) so the panel sits tight
        // against the viewport's right edge at the end of the ribbon.
        marginRight: "-12vw",
        // A tail of its own colour, so leaning in with the meter widens the
        // panel instead of pulling it off the right edge.
        boxShadow: `${NEXT_PANEL_LEAN}px 0 0 ${NEXT_PANEL_BG}`,
        ...style,
      }}
    >
      <span
        ref={titleRef}
        className={`absolute left-10 top-1/2 -translate-y-1/2 ${CASE_TITLE_CLASS}`}
        style={{ color: NEXT_TITLE_GREY }}
      >
        {next.name}
      </span>
      <NextPanelDecor hintRef={hintRef} />
    </button>
  );
}

// Shared bordered pill/circle wrapper that slides a colored fill in from the
// left on hover and inverts its text/icon color — mirrors the nav buttons'
// hover behavior so both surfaces feel part of the same system.
function HoverFillPill({
  children,
  href,
  target,
  rel,
  download,
  onClick,
  ariaLabel,
  className,
  borderColor,
  fillColor,
  fillTextColor,
}: {
  children: React.ReactNode;
  href?: string;
  target?: string;
  rel?: string;
  download?: boolean;
  onClick?: () => void;
  ariaLabel?: string;
  className?: string;
  borderColor: string;
  fillColor: string;
  fillTextColor: string;
}) {
  const [hovered, setHovered] = useState(false);
  const overlay = (
    <span
      aria-hidden="true"
      className="absolute inset-0 origin-left"
      style={{
        backgroundColor: fillColor,
        transform: hovered ? "scaleX(1)" : "scaleX(0)",
        transition: "transform 0.4s cubic-bezier(0.23,1,0.32,1)",
      }}
    />
  );
  const inner = (
    <span className="relative z-[1] inline-flex items-center justify-center gap-3 w-full h-full">
      {children}
    </span>
  );
  const commonClass = `relative overflow-hidden border cursor-none ${className ?? ""}`;
  const commonStyle: React.CSSProperties = {
    borderColor,
    color: hovered ? fillTextColor : borderColor,
    transition: "color 0.3s ease 0.1s",
  };
  const commonProps = {
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
    className: commonClass,
    style: commonStyle,
  };

  if (href) {
    return (
      <a
        href={href}
        target={target}
        rel={rel}
        download={download}
        aria-label={ariaLabel}
        {...commonProps}
      >
        {overlay}
        {inner}
      </a>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      {...commonProps}
    >
      {overlay}
      {inner}
    </button>
  );
}

function GitHubIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 .5C5.73.5.67 5.56.67 11.84c0 5.02 3.26 9.28 7.78 10.79.57.1.78-.25.78-.55 0-.27-.01-1-.02-1.96-3.17.69-3.84-1.52-3.84-1.52-.52-1.31-1.27-1.66-1.27-1.66-1.04-.71.08-.69.08-.69 1.15.08 1.75 1.18 1.75 1.18 1.02 1.74 2.67 1.24 3.32.95.1-.74.4-1.24.72-1.53-2.53-.29-5.2-1.26-5.2-5.62 0-1.24.44-2.26 1.17-3.06-.12-.29-.51-1.45.11-3.02 0 0 .96-.31 3.14 1.17a10.9 10.9 0 0 1 5.72 0c2.18-1.48 3.14-1.17 3.14-1.17.62 1.57.23 2.73.11 3.02.73.8 1.17 1.82 1.17 3.06 0 4.37-2.67 5.33-5.22 5.61.41.35.77 1.05.77 2.12 0 1.53-.01 2.77-.01 3.14 0 .3.21.66.79.55 4.52-1.51 7.78-5.77 7.78-10.79C23.33 5.56 18.27.5 12 .5z" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 4v12m0 0l-5-5m5 5l5-5M5 20h14"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LaunchArrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7 17 L17 7 M8 7 H17 V16"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
