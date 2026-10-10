"use client";

import { useEffect, useRef, useState } from "react";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import BlurReveal from "../components/animations/BlurReveal";
import { scrollToSocialsFooter } from "../components/utils";

export default function PrivacyPage() {
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
        {/* ─── Header ─── */}
        <section className="pt-32 md:pt-40 pb-10 md:pb-14 px-6 md:px-12">
          <div className="max-w-[1000px] mx-auto">
            <BlurReveal>
              <p className="text-[14px] tracking-[0.15em] uppercase text-[#111111]/50 mb-4">
                Privacy
              </p>
            </BlurReveal>
            <BlurReveal delay={0.06}>
              <h1 className="text-h1 text-[#111111] mb-2">Privacy</h1>
            </BlurReveal>
            <BlurReveal delay={0.12}>
              <p className="text-body text-[#111111]/70">
                Last updated 6 May 2026.
              </p>
            </BlurReveal>
          </div>
        </section>

        {/* ─── The short version ─── */}
        <section className="py-10 md:py-14 px-6 md:px-12 border-t border-[#111111]/10">
          <div className="max-w-[1000px] mx-auto grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 md:gap-16">
            <BlurReveal>
              <p className="text-[14px] tracking-[0.15em] uppercase text-[#111111]/50">
                The short version
              </p>
            </BlurReveal>
            <BlurReveal delay={0.1}>
              <p className="text-body text-[#111111]/80">
                This is a personal portfolio. I use lightweight analytics so I
                can see how people experience the site and improve it over
                time. I don&apos;t sell your data, share it with advertisers,
                or use it for anything beyond making this site better.
              </p>
            </BlurReveal>
          </div>
        </section>

        {/* ─── What I collect ─── */}
        <section className="py-10 md:py-14 px-6 md:px-12 border-t border-[#111111]/10">
          <div className="max-w-[1000px] mx-auto grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 md:gap-16">
            <BlurReveal>
              <p className="text-[14px] tracking-[0.15em] uppercase text-[#111111]/50">
                What I collect
              </p>
            </BlurReveal>
            <div className="flex flex-col gap-6">
              <BlurReveal delay={0.1}>
                <div>
                  <h3 className="text-[18px] font-medium text-[#111111] mb-2">
                    Vercel Analytics
                  </h3>
                  <p className="text-body text-[#111111]/80">
                    Anonymous traffic stats — page views, referrer, country,
                    and device type. No cookies, no personal information,
                    just numbers.
                  </p>
                </div>
              </BlurReveal>
              <BlurReveal delay={0.18}>
                <div>
                  <h3 className="text-[18px] font-medium text-[#111111] mb-2">
                    Microsoft Clarity
                  </h3>
                  <p className="text-body text-[#111111]/80">
                    Session recordings and heatmaps showing how visitors
                    scroll, click, and move through the site. Recordings only
                    capture interactions with this page — never your screen,
                    other tabs, or anything outside the browser. Microsoft
                    processes this data on its servers; their privacy notice
                    is at{" "}
                    <a
                      href="https://privacy.microsoft.com/privacystatement"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:no-underline"
                    >
                      privacy.microsoft.com
                    </a>
                    .
                  </p>
                </div>
              </BlurReveal>
            </div>
          </div>
        </section>

        {/* ─── What I don't do ─── */}
        <section className="py-10 md:py-14 px-6 md:px-12 border-t border-[#111111]/10">
          <div className="max-w-[1000px] mx-auto grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 md:gap-16">
            <BlurReveal>
              <p className="text-[14px] tracking-[0.15em] uppercase text-[#111111]/50">
                What I don&apos;t do
              </p>
            </BlurReveal>
            <BlurReveal delay={0.1}>
              <ul className="space-y-3 text-body text-[#111111]/80">
                {[
                  "Sell or share your data with advertisers, marketers, or third parties.",
                  "Track you across other websites.",
                  "Collect names, emails, or messages unless you choose to email me directly.",
                  "Run advertising or retargeting of any kind.",
                ].map((item) => (
                  <li
                    key={item}
                    className="relative pl-5 before:content-[''] before:absolute before:left-0 before:top-[0.7em] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#111111]/40"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </BlurReveal>
          </div>
        </section>

        {/* ─── Cookies ─── */}
        <section className="py-10 md:py-14 px-6 md:px-12 border-t border-[#111111]/10">
          <div className="max-w-[1000px] mx-auto grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 md:gap-16">
            <BlurReveal>
              <p className="text-[14px] tracking-[0.15em] uppercase text-[#111111]/50">
                Cookies
              </p>
            </BlurReveal>
            <BlurReveal delay={0.1}>
              <p className="text-body text-[#111111]/80">
                Microsoft Clarity sets cookies to recognise the same visitor
                across pages within a single session. These cookies don&apos;t
                follow you across other websites. Vercel Analytics uses no
                cookies. You can clear or block these in your browser
                settings at any time.
              </p>
            </BlurReveal>
          </div>
        </section>

        {/* ─── Your rights ─── */}
        <section className="py-10 md:py-14 px-6 md:px-12 border-t border-[#111111]/10">
          <div className="max-w-[1000px] mx-auto grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 md:gap-16">
            <BlurReveal>
              <p className="text-[14px] tracking-[0.15em] uppercase text-[#111111]/50">
                Your rights
              </p>
            </BlurReveal>
            <BlurReveal delay={0.1}>
              <p className="text-body text-[#111111]/80">
                If you&apos;d like a record of any visit deleted, want to opt
                out, or just have a question — email me at{" "}
                <a
                  href="mailto:peter.business.203@gmail.com"
                  className="underline hover:no-underline"
                >
                  peter.business.203@gmail.com
                </a>
                . I&apos;ll respond within a few days.
              </p>
            </BlurReveal>
          </div>
        </section>
      </main>

      <Footer highlight={socialsHighlight} />
    </>
  );
}
