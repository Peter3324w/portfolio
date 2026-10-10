"use client";

import { useEffect, useRef, useState } from "react";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import BlurReveal from "../components/animations/BlurReveal";
import { scrollToSocialsFooter } from "../components/utils";

export default function AboutPage() {
  const mainRef = useRef<HTMLElement>(null);
  const [overFooter, setOverFooter] = useState(false);
  const [socialsHighlight, setSocialsHighlight] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const main = mainRef.current;
      if (!main) return;
      const mainBottom = main.offsetTop + main.offsetHeight;
      setOverFooter(window.scrollY + 64 > mainBottom);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <Nav
        overFooter={overFooter}
        onSocialsClick={() =>
          scrollToSocialsFooter(() => setSocialsHighlight((v) => v + 1))
        }
      />

      <main
        ref={mainRef}
        className={`relative z-[2] bg-[#f6f6f6] mb-[calc(100vh+140px)] ${
          overFooter ? "pointer-events-none" : ""
        }`}
      >
        {/* ─── Profile Header (banner + avatar) ─── */}
        <section className="relative">
          {/* Cover banner — replace gradient with a real image later */}
          <div
            className="w-full h-[240px] md:h-[320px] relative overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, #1f1f1f 0%, #2a2a2a 30%, #3a3a3a 60%, #151515 100%)",
            }}
          >
            {/* Subtle grain/vignette */}
            <div
              className="absolute inset-0 opacity-40 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.5) 100%)",
              }}
            />
          </div>

          {/* Identity block */}
          <div className="max-w-[1000px] mx-auto px-6 md:px-12 relative">
            <div className="pt-10 md:pt-14">
              {/* Name + title + actions */}
              <div>
                <BlurReveal>
                  <h1 className="text-h1 text-[#111111] mb-2">Peter Phiri</h1>
                </BlurReveal>
                <BlurReveal delay={0.08}>
                  <p className="text-body text-[#111111]/70 uppercase tracking-wider mb-4">
                    UX / Product Designer
                  </p>
                </BlurReveal>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Availability pill — mailto link with hover fill */}
                  <a
                    href="mailto:peter.business.203@gmail.com"
                    className="group relative overflow-hidden inline-flex items-center gap-2 px-4 py-3 rounded-full bg-[#111111]/[0.06] text-[13px] uppercase tracking-wider cursor-none"
                  >
                    <span className="absolute inset-0 bg-[#111111] transform scale-x-0 origin-left transition-transform duration-400 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-x-100" />
                    <span className="relative z-[1] flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-[#22c55e] opacity-60 animate-ping" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-[#22c55e]" />
                    </span>
                    <span className="relative z-[1] text-[#111111] transition-colors duration-300 delay-100 group-hover:text-[#f6f6f6]">
                      Open to work
                    </span>
                  </a>

                  {/* Resume button — same pill style as Open to work */}
                  <a
                    href="/peter-phiri-resume.pdf"
                    download
                    className="group relative overflow-hidden inline-flex items-center gap-2 px-4 py-3 rounded-full bg-[#111111]/[0.06] text-[13px] uppercase tracking-wider cursor-none"
                  >
                    <span className="absolute inset-0 bg-[#111111] transform scale-x-0 origin-left transition-transform duration-400 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-x-100" />
                    <span className="relative z-[1] text-[#111111] transition-colors duration-300 delay-100 group-hover:text-[#f6f6f6]">
                      Resume
                    </span>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="relative z-[1] text-[#111111] transition-colors duration-300 delay-100 group-hover:text-[#f6f6f6]"
                    >
                      <path
                        d="M12 3 V15 M7 10 L12 15 L17 10 M4 20 H20"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </a>

                  {/* Inline social icons */}
                  <div className="flex items-center gap-2">
                    <a
                      href="https://x.com/203Peter"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Twitter"
                      className="w-9 h-9 rounded-full border border-[#111111]/20 flex items-center justify-center hover:bg-[#111111] hover:border-[#111111] transition-colors duration-300 cursor-none group"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 90 90"
                        className="text-[#111111] group-hover:text-[#f6f6f6] transition-colors duration-300"
                        fill="currentColor"
                      >
                        <path d="M 17.884 19.496 L 38.925 47.63 L 17.751 70.504 h 4.765 l 18.538 -20.027 l 14.978 20.027 h 16.217 L 50.024 40.788 l 19.708 -21.291 h -4.765 L 47.895 37.94 L 34.101 19.496 H 17.884 z M 24.892 23.006 h 7.45 L 65.24 66.993 h -7.45 L 24.892 23.006 z" />
                      </svg>
                    </a>
                    <a
                      href="https://www.linkedin.com/in/peter-phiri-3324w"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="LinkedIn"
                      className="w-9 h-9 rounded-full border border-[#111111]/20 flex items-center justify-center hover:bg-[#111111] hover:border-[#111111] transition-colors duration-300 cursor-none group"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 90 90"
                        className="text-[#111111] group-hover:text-[#f6f6f6] transition-colors duration-300"
                        fill="currentColor"
                      >
                        <rect x="23.24" y="37.45" width="9.33" height="30" />
                        <path d="M 27.904 33.356 c -2.988 0 -5.404 -2.423 -5.404 -5.406 c 0 -2.986 2.417 -5.41 5.405 -5.41 c 2.982 0 5.405 2.423 5.405 5.41 C 33.309 30.933 30.885 33.356 27.904 33.356 z" />
                        <path d="M 67.5 67.46 h -9.321 V 52.869 c 0 -3.48 -0.06 -7.956 -4.847 -7.956 c -4.853 0 -5.594 3.793 -5.594 7.706 V 67.46 h -9.321 V 37.455 h 8.945 v 4.103 h 0.127 c 1.245 -2.36 4.288 -4.847 8.824 -4.847 c 9.444 0 11.187 6.213 11.187 14.292 V 67.46 z" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ─── Bio + Timeline ─── */}
        <section className="py-20 md:py-28 px-6 md:px-12">
          <div className="max-w-[1000px] mx-auto grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-12 md:gap-16">
            {/* Bio */}
            <div>
              <BlurReveal>
                <p className="text-[11px] tracking-[0.15em] uppercase text-[#111111]/50 mb-4">
                  About
                </p>
              </BlurReveal>
              <BlurReveal delay={0.1}>
                <div className="space-y-5 text-body text-[#111111]/80">
                  <p>
                    I&apos;m a UX / Product designer based somewhere between
                    late-night wireframes and early-morning coffee. Two years,
                    twelve projects, and a stubborn belief that design is
                    problem-solving — not decoration.
                  </p>
                  <p>
                    I started in graphic design, got curious about why people
                    struggled with the interfaces they used every day, and
                    never looked back. I care about the gap between what users
                    need and what businesses can ship, and I spend most of my
                    time trying to close it.
                  </p>
                  <p>
                    When I&apos;m not designing, I&apos;m probably reading
                    about design, sketching, or quietly judging the
                    onboarding flow of whatever app I&apos;m signing up for.
                  </p>
                </div>
              </BlurReveal>
            </div>

            {/* Experience Timeline */}
            <div>
              <BlurReveal>
                <p className="text-[11px] tracking-[0.15em] uppercase text-[#111111]/50 mb-6">
                  Experience
                </p>
              </BlurReveal>
              <ol className="relative border-l border-[#111111]/15 ml-3">
                {[
                  {
                    period: "April 2025 — Present",
                    role: "Freelance Product Designer",
                    org: "Independent",
                    body: "Partnering with clients to define product goals, user needs, and visual identity for digital products. Handling the end-to-end design process from discovery through developer handoff.",
                  },
                  {
                    period: "Nov 2024 — March 2025",
                    role: "Product Design Intern",
                    org: "Baboons",
                    body: "Designed responsive landing pages including the Cafe de Snor site, built component libraries, and prepared hi-fi specs for developer handoff. Supported competitive research, weekly critiques, and client prototypes.",
                  },
                ].map((item, i) => (
                  <BlurReveal key={i} delay={0.15 + i * 0.1}>
                    <li className={`relative pl-8 ${i > 0 ? "mt-6" : ""}`}>
                      <span className="absolute -left-[7px] top-[6px] w-3 h-3 rounded-full bg-[#111111]" />
                      <p className="text-[12px] tracking-[0.15em] uppercase text-[#111111]/50 mb-1">
                        {item.period}
                      </p>
                      <h3 className="text-[24px] leading-[1.2] font-medium text-[#111111] mb-1">
                        {item.role}
                      </h3>
                      <p className="text-body text-[#111111]/60 mb-2">
                        {item.org}
                      </p>
                      <p className="text-body text-[#111111]/80">
                        {item.body}
                      </p>
                    </li>
                  </BlurReveal>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* ─── Tools ─── */}
        <section className="py-10 md:py-14 px-6 md:px-12 border-t border-[#111111]/10">
          <div className="max-w-[1000px] mx-auto">
            <BlurReveal>
              <p className="text-[11px] tracking-[0.15em] uppercase text-[#111111]/50 mb-6">
                Tools I live in
              </p>
            </BlurReveal>
            <BlurReveal delay={0.1}>
              <div className="flex flex-wrap gap-3">
                {[
                  { name: "Figma" },
                  { name: "Framer" },
                ].map((tool) => (
                  <span
                    key={tool.name}
                    className="inline-flex items-center gap-3 px-5 py-3 rounded-full bg-[#111111]/[0.04] border border-[#111111]/10 text-body text-[#111111]"
                  >
                    <span className="w-2 h-2 rounded-full bg-[#111111]" />
                    {tool.name}
                  </span>
                ))}
              </div>
            </BlurReveal>
          </div>
        </section>

      </main>

      <Footer highlight={socialsHighlight} />
    </>
  );
}
