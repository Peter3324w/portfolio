"use client";

import { useEffect, useRef, useState } from "react";
import BlurReveal from "./BlurReveal";
import ProcessArtboard from "./ProcessArtboard";
import { FRAME, FRAME_GUTTER, LINE_WEAK } from "../home/frame";
import StarTags from "../home/StarTags";

export interface AccordionItem {
  title: string;
  body: string;
  tags?: string[];
}

interface ScrollAccordionProps {
  label: string;
  heading: string;
  mobileHeading?: string;
  items: AccordionItem[];
}

function renderHeadingLines(text: string) {
  return text.split("\n").map((line, i, arr) => (
    <span key={i}>
      {line}
      {i < arr.length - 1 && <br />}
    </span>
  ));
}

const COLUMNS = "md:grid-cols-[minmax(0,1.08fr)_minmax(0,1fr)]";

// Pinned, scroll-driven steps on black. Left: heading + an Attio-style list
// where the open step shows its body and a bar that fills as you scroll
// through it. Right: the wireframe funnel, which flattens step by step.
export default function ScrollAccordion({ label, heading, mobileHeading, items }: ScrollAccordionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const barRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const [openIndex, setOpenIndex] = useState(-1);

  useEffect(() => {
    let ticking = false;
    const update = () => {
      ticking = false;
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = el.offsetHeight - window.innerHeight;
      const scrolled = Math.min(total, Math.max(0, -rect.top));
      const progress = total > 0 ? scrolled / total : 0;
      const slices = items.length + 2;
      const pos = progress * slices;
      const raw = Math.floor(pos) - 1;
      // Nothing open on the lead-in slice; the last step stays open on the
      // tail slice so the list doesn't collapse while it's still pinned.
      const idx = raw < 0 ? -1 : Math.min(raw, items.length - 1);
      setOpenIndex(idx);

      // Progress bars are written directly — no re-render per scroll frame.
      barRefs.current.forEach((bar, i) => {
        if (!bar) return;
        const fill = i < raw ? 1 : i === raw ? pos - Math.floor(pos) : 0;
        bar.style.transform = `scaleX(${fill})`;
      });
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [items.length]);

  return (
    <div
      ref={sectionRef}
      style={{ height: `${(items.length + 2) * 700}px` }}
      className="relative"
    >
      {/* Column divider, running the full pinned distance */}
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 max-md:hidden ${FRAME_GUTTER}`}
      >
        <div className={`${FRAME} grid h-full ${COLUMNS}`}>
          <div />
          <div className={`border-l ${LINE_WEAK}`} />
        </div>
      </div>

      {/* On phones the pinned block is only as tall as its content — a
          full-screen box left the steps floating in the middle of the
          screen with dead space above and below. */}
      <div className={`sticky top-0 md:h-screen md:max-h-[900px] ${FRAME_GUTTER}`}>
        <div className={`${FRAME} grid md:h-full ${COLUMNS}`}>
          {/* Left: label, heading, steps */}
          <div className="flex flex-col justify-start md:justify-center px-5 md:px-12 pt-24 pb-14 md:py-16">
            <BlurReveal>
              <span className="inline-block rounded-lg bg-white/[0.07] px-2.5 py-1 text-[13px] text-[#f6f6f6]/80">
                {label}
              </span>
            </BlurReveal>
            <BlurReveal delay={0.1}>
              <h2
                className={`mt-5 text-h2 text-[#f6f6f6] [@media(min-width:768px)_and_(max-height:780px)]:text-[36px] ${mobileHeading ? "max-md:hidden" : ""}`}
                style={{ fontWeight: 400 }}
              >
                {renderHeadingLines(heading)}
              </h2>
              {mobileHeading && (
                <h2
                  className="mt-5 text-h2 text-[#f6f6f6] md:hidden"
                  style={{ fontWeight: 400 }}
                  aria-hidden="true"
                >
                  {renderHeadingLines(mobileHeading)}
                </h2>
              )}
            </BlurReveal>

            <ol className="mt-10 md:mt-12 [@media(max-height:780px)]:mt-6 max-w-[520px]">
              {items.map((item, i) => {
                const isOpen = i === openIndex;
                return (
                  <li key={item.title} className="py-2.5 md:py-3 [@media(max-height:780px)]:py-2">
                    <BlurReveal delay={0.15 + i * 0.08}>
                      <p
                        className={`text-[16px] md:text-[18px] tracking-wide uppercase transition-colors duration-500 ${
                          isOpen ? "text-[#f6f6f6]" : "text-[#f6f6f6]/40"
                        }`}
                      >
                        {item.title}
                      </p>
                    </BlurReveal>

                    <div
                      className="grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
                      style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                    >
                      <div className="overflow-hidden">
                        <div
                          className="pt-3 transition-[opacity,filter] duration-500"
                          style={{
                            opacity: isOpen ? 1 : 0,
                            filter: isOpen ? "blur(0px)" : "blur(1px)",
                          }}
                        >
                          <p className="text-body text-[#f6f6f6]/60">{item.body}</p>
                          {item.tags && item.tags.length > 0 && (
                            <StarTags
                              tags={item.tags}
                              className="mt-4 [@media(max-height:780px)]:hidden"
                            />
                          )}
                          <span className="mt-5 block h-[2px] w-full overflow-hidden rounded-full bg-white/[0.12]">
                            <span
                              ref={(el) => {
                                barRefs.current[i] = el;
                              }}
                              className="block h-full w-full origin-left bg-[#f6f6f6]/70"
                              style={{ transform: "scaleX(0)" }}
                            />
                          </span>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* Right: the artboard */}
          <div className="relative max-md:hidden">
            <ProcessArtboard step={openIndex} />
          </div>
        </div>
      </div>
    </div>
  );
}
