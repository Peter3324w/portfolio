"use client";

import { useEffect, useRef, useState } from "react";
import BlurReveal from "../animations/BlurReveal";
import HoverLottie from "../animations/HoverLottie";
import type { SkillCard } from "../../lib/home-data";
import { FRAME, FRAME_GUTTER, LINE_INK, LINE_INK_WEAK } from "./frame";
import { useMagneticPull } from "../../lib/useMagneticPull";
import FlyCorridor from "./FlyCorridor";
import { useFlyThrough } from "./useFlyThrough";

type SkillSet = "design" | "code";

const SETS: { key: SkillSet; label: string }[] = [
  { key: "design", label: "Design" },
  { key: "code", label: "Code" },
];

// How long the outgoing cards get to clear before the new set lands. Covers
// the 0.3s fade plus the stagger across all eight cards.
const SWAP_OUT_MS = 520;
const EASE = "cubic-bezier(0.23,1,0.32,1)";

export default function SkillsAndCtaSection({
  skills,
  codeSkills,
  stack,
}: {
  skills: Array<SkillCard | null>;
  codeSkills: Array<SkillCard | null>;
  stack: string[];
}) {
  const [skillsVisible, setSkillsVisible] = useState(false);
  const [ctaMobileVisible, setCtaMobileVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [hoveredSkill, setHoveredSkill] = useState<number | null>(null);
  const skillsRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const dustRef = useRef<HTMLCanvasElement>(null);
  const holeRef = useRef<HTMLDivElement>(null);
  const holeFillRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  // `set` follows the switch immediately; `shownSet` is what the cards
  // render, and trails it by the fade-out so the old cards clear first.
  const [set, setSet] = useState<SkillSet>("design");
  const [shownSet, setShownSet] = useState<SkillSet>("design");
  const [swapping, setSwapping] = useState(false);
  const swapTimer = useRef<number | null>(null);

  const switchTo = (next: SkillSet) => {
    if (next === set) return;
    setSet(next);
    if (swapTimer.current) window.clearTimeout(swapTimer.current);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShownSet(next);
      setSwapping(false);
      return;
    }
    setSwapping(true);
    swapTimer.current = window.setTimeout(() => {
      setShownSet(next);
      setSwapping(false);
      swapTimer.current = null;
    }, SWAP_OUT_MS);
  };

  useEffect(
    () => () => {
      if (swapTimer.current) window.clearTimeout(swapTimer.current);
    },
    []
  );

  const cards = shownSet === "code" ? codeSkills : skills;

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Desktop: scrolling flies the camera from the grid, through its centre
  // cell and down a corridor, to the contact section. See useFlyThrough.
  useFlyThrough({
    section: sectionRef,
    stage: stageRef,
    canvas: dustRef,
    hole: holeRef,
    holeFill: holeFillRef,
  });

  // Drawn in at the section's edge, landing on the grid at rest — the same
  // move DarkZone uses.
  useMagneticPull(sectionRef, { seconds: 1.2 });

  useEffect(() => {
    const el = skillsRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setSkillsVisible(true);
            io.disconnect();
          }
        });
      },
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Mobile-only: CTA zooms in when it enters view.
  useEffect(() => {
    const el = ctaRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && window.innerWidth < 768) {
            setCtaMobileVisible(true);
            io.disconnect();
          }
        });
      },
      { threshold: 0.25 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={sectionRef} className="relative bg-[#f6f6f6] md:h-[700vh]">
      {/* Rails through the light section on phones; on desktop each plane
          carries its own, so they travel with it. */}
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 z-[3] md:hidden ${FRAME_GUTTER}`}
      >
        <div className={`${FRAME} h-full border-x ${LINE_INK}`} />
      </div>

      {/* The stage. Phones stack the grid and the contact section; desktop
          pins a black viewport and places every [data-fly] plane along one
          corridor, farthest first. */}
      <div
        ref={stageRef}
        data-nav-dark="off"
        data-cursor-theme="dark"
        className="relative flex flex-col md:block md:sticky md:top-0 md:h-screen md:overflow-hidden md:bg-black"
      >
        <canvas
          ref={dustRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full max-md:hidden"
        />

        {/* Farthest: the contact section, the light at the end of the
            corridor until the camera arrives and it fills the screen. */}
        <div
          data-fly="end"
          data-cursor-theme="dark"
          className={`relative order-2 bg-[#f6f6f6] mt-16 pb-24 md:absolute md:inset-0 md:m-0 md:flex md:items-center md:justify-center md:pb-0 md:shadow-[0_0_140px_40px_rgba(246,246,246,0.14)] ${FRAME_GUTTER}`}
        >
          {/* Hatch with a clear oval around the words, inside the frame */}
          <div
            aria-hidden
            className={`pointer-events-none absolute inset-0 max-md:hidden ${FRAME_GUTTER}`}
          >
            <div className={`${FRAME} hatch-ink hatch-hole h-full border-x ${LINE_INK}`} />
          </div>
          <div
            ref={ctaRef}
            className="relative flex flex-col items-center text-center max-w-[900px] mx-auto"
            style={
              isMobile
                ? {
                    transformOrigin: "center center",
                    opacity: ctaMobileVisible ? 1 : 0,
                    transform: `scale(${ctaMobileVisible ? 1 : 0.35})`,
                    transition:
                      "opacity 1s ease, transform 1s cubic-bezier(0.23,1,0.32,1)",
                  }
                : undefined
            }
          >
            <div
              aria-hidden
              className="soft-shade inset-x-[10%] top-[18%] h-[9rem]"
            />
            <h2
              className="relative text-[#111111] uppercase text-[40px] md:text-[72px] leading-[1.1] md:leading-[80px]"
              style={{ fontWeight: 400 }}
            >
              Got an idea?
              <br />
              Tell me about it.
            </h2>
            <a
              href="mailto:peter.business.203@gmail.com"
              data-cursor-theme="light"
              className="group relative mt-12 inline-flex items-center gap-4 overflow-hidden rounded-full border border-[#111111] px-10 py-5 cursor-none"
            >
              <span className="absolute inset-0 bg-[#111111] transform scale-x-0 origin-left transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-x-100" />
              <span className="relative z-[1] uppercase tracking-wide text-sm text-[#111111] transition-colors duration-300 delay-100 group-hover:text-[#f6f6f6]">
                Get in touch
              </span>
              <svg
                width="32"
                height="16"
                viewBox="0 0 40 20"
                fill="none"
                aria-hidden
                className="relative z-[1] text-[#111111] transition-colors duration-300 delay-100 group-hover:text-[#f6f6f6]"
              >
                <path
                  d="M2 10 H36 M28 2 L36 10 L28 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          </div>
        </div>

        <FlyCorridor />

        {/* Nearest: the skills grid. On desktop its centre cell is a hole in
            a paper wall, and the corridor lies behind it. */}
        <div
          data-fly="wall"
          className="relative order-1 md:absolute md:inset-0 md:overflow-hidden"
        >
          <div
            className={`md:absolute md:inset-0 md:flex md:items-center md:justify-center ${FRAME_GUTTER} pt-16 md:pt-0`}
          >
            <div className={`relative ${FRAME}`}>
              <div
                ref={skillsRef}
                className="relative grid grid-cols-1 md:grid-cols-3"
              >
                {/* The grid's top and bottom rules, drawn above the hole's
                    paper so it can't cover them. */}
                <div
                  aria-hidden
                  className={`pointer-events-none absolute inset-0 z-[2] border-y ${LINE_INK_WEAK}`}
                />
                {cards.map((card, i) => {
                  const col = i % 3;
                  const row = Math.floor(i / 3);
                  const lastRow = row === Math.floor((cards.length - 1) / 3);
                  const borders = `${LINE_INK_WEAK} ${col < 2 ? "md:border-r" : ""} ${
                    lastRow ? "" : "md:border-b"
                  }`;

                  // The centre cell holds the title and the switch. On desktop
                  // it's the hole: its paper shadow paints the wall around the
                  // grid, and its fill fades to open the way into the corridor.
                  // Its own lines sit over the black stage, not paper, so the
                  // 8% ink would read as solid black; #e4e4e4 is that 8% ink
                  // already mixed onto #f6f6f6, so it matches the other lines.
                  if (!card) {
                    return (
                      <div
                        key={i}
                        ref={holeRef}
                        className={`relative max-md:order-first max-md:border-b md:z-0 md:h-[190px] md:shadow-[0_0_0_200vmax_#f6f6f6] ${borders} md:border-[#e4e4e4]`}
                      >
                        <div
                          ref={holeFillRef}
                          className="relative flex flex-col items-start md:items-center justify-center gap-4 px-5 py-10 md:absolute md:inset-0 md:p-8 md:bg-[#f6f6f6]"
                        >
                          <div
                            aria-hidden
                            className="soft-shade inset-x-[18%] inset-y-[28%] max-md:hidden"
                          />
                          <BlurReveal>
                            <h2
                              className="relative text-[#111111] text-[36px] md:text-[56px]"
                              style={{ lineHeight: 1.1 }}
                            >
                              My Skills
                            </h2>
                          </BlurReveal>
                          <BlurReveal delay={0.1}>
                            <div
                              role="group"
                              aria-label="Skill set"
                              data-cursor-theme="light"
                              className={`relative inline-flex rounded-full border ${LINE_INK} p-1`}
                            >
                              <span
                                aria-hidden
                                className="absolute left-1 top-1 bottom-1 w-[84px] rounded-full bg-[#111111] transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]"
                                style={{
                                  transform:
                                    set === "code" ? "translateX(100%)" : "none",
                                }}
                              />
                              {SETS.map(({ key, label }) => (
                                <button
                                  key={key}
                                  type="button"
                                  aria-pressed={set === key}
                                  onClick={() => switchTo(key)}
                                  className={`relative z-[1] w-[84px] rounded-full py-2 text-[12px] uppercase tracking-wider cursor-none transition-colors duration-300 ${
                                    set === key
                                      ? "text-[#f6f6f6]"
                                      : "text-[#111111]/55 hover:text-[#111111]"
                                  }`}
                                >
                                  {label}
                                </button>
                              ))}
                            </div>
                          </BlurReveal>
                        </div>
                      </div>
                    );
                  }

                  // Reading order among the eight cards (the centre cell skipped),
                  // which staggers the swap between sets.
                  const order = cards.slice(0, i).filter(Boolean).length;

                  const hiddenTransform =
                    col === 0
                      ? "translateX(-60px)"
                      : col === 1
                        ? "translateY(40px)"
                        : "translateX(60px)";
                  const delay = row * 0.15 + col * 0.1;
                  return (
                    <div
                      key={i}
                      data-cursor-theme="light"
                      onMouseEnter={() => setHoveredSkill(i)}
                      onMouseLeave={() =>
                        setHoveredSkill((cur) => (cur === i ? null : cur))
                      }
                      className={`group relative overflow-hidden px-5 py-6 md:z-[1] md:p-8 md:h-[190px] cursor-none ${
                        i < cards.length - 1 ? "max-md:border-b" : ""
                      } ${borders}`}
                    >
                      <span className="absolute inset-0 bg-[#111111] transform scale-x-0 origin-left transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-x-100" />
                      <div
                        className="relative z-[1] h-full"
                        style={{
                          opacity: skillsVisible ? 1 : 0,
                          transform: skillsVisible
                            ? "translate(0,0)"
                            : hiddenTransform,
                          transition: `opacity 1.3s cubic-bezier(0.23,1,0.32,1) ${delay}s, transform 1.3s cubic-bezier(0.23,1,0.32,1) ${delay}s`,
                        }}
                      >
                        {/* Swapping sets: the old card sinks and blurs out, the
                            new one rises back into place, one card after another. */}
                        <div
                          className="h-full flex flex-col"
                          style={{
                            opacity: swapping ? 0 : 1,
                            transform: swapping ? "translateY(12px)" : "none",
                            filter: swapping ? "blur(6px)" : "none",
                            transition: swapping
                              ? `opacity 0.3s ease ${order * 0.03}s, transform 0.3s ease ${order * 0.03}s, filter 0.3s ease ${order * 0.03}s`
                              : `opacity 0.6s ${EASE} ${order * 0.05}s, transform 0.8s ${EASE} ${order * 0.05}s, filter 0.6s ${EASE} ${order * 0.05}s`,
                          }}
                        >
                          <div className="text-[#111111]/50 transition-[color,filter] duration-300 delay-100 group-hover:text-[#f6f6f6] group-hover:[filter:brightness(0)_invert(1)]">
                            <HoverLottie
                              src={card.lottie}
                              hovered={hoveredSkill === i}
                              size={24}
                            />
                          </div>
                          <h3 className="mt-4 text-[20px] leading-[1.2] text-[#111111] transition-colors duration-300 delay-100 group-hover:text-[#f6f6f6]">
                            {card.title}
                          </h3>
                          <p className="mt-3 text-body text-[#111111]/50 transition-colors duration-300 delay-100 group-hover:text-[#f6f6f6]/70">
                            {card.desc}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Languages and tools. On desktop it hangs below the grid rather
                  than sitting in the flow, so the grid stays centred on the
                  zoom's origin. */}
              <div
                className={`relative md:absolute md:inset-x-0 md:top-full md:z-[1] border-b ${LINE_INK_WEAK} px-5 py-6 md:px-8 md:py-3`}
                style={{
                  opacity: skillsVisible ? 1 : 0,
                  transition: `opacity 1.3s ${EASE} 0.6s`,
                }}
              >
                <ul
                  aria-label="Languages and tools"
                  className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5"
                >
                  {stack.map((item, i) => (
                    <li
                      key={item}
                      className="inline-flex items-center gap-3 text-[13px] text-[#111111]/70"
                    >
                      {i > 0 && (
                        <span
                          aria-hidden
                          className="h-[3px] w-[3px] rounded-full bg-[#111111]/25"
                        />
                      )}
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <div
            aria-hidden
            className={`pointer-events-none absolute inset-0 z-[2] max-md:hidden ${FRAME_GUTTER}`}
          >
            <div className={`${FRAME} h-full border-x ${LINE_INK}`} />
          </div>
        </div>
      </div>
    </div>
  );
}
