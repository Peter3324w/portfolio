"use client";

import { useEffect, useRef, useState } from "react";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import BlurReveal from "../components/animations/BlurReveal";
import { scrollToSocialsFooter } from "../components/utils";

const RESUME_URL = "/peter-phiri-resume.pdf";

export default function ResumePage() {
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

  const skills: { label: string; items: string[] }[] = [
    {
      label: "UX",
      items: [
        "User Research",
        "Personas",
        "Wireframing",
        "Information Architecture",
        "User Flows",
      ],
    },
    {
      label: "UI",
      items: [
        "Visual Design",
        "Typography",
        "Grid Systems",
        "Component Design",
        "Responsive Layouts",
      ],
    },
    {
      label: "Tools",
      items: [
        "Figma (Auto Layout, Variables, Components)",
        "Prototyping",
      ],
    },
    {
      label: "Focus Areas",
      items: [
        "Mobile Design",
        "Landing Pages",
        "SaaS Dashboards",
        "Design Systems",
      ],
    },
  ];

  const experience = [
    {
      period: "April 2026 — Present",
      role: "Product Designer and Frontend Developer",
      org: "Metina Platforms",
      bullets: [
        "Redesigning Metibuy, the company's 10+ page marketing site, owning both product design and frontend implementation.",
        "Leading the upcoming redesign of the main Metina Platforms product.",
      ],
    },
    {
      period: "April 2025 — Present",
      role: "Freelance Product Designer",
      org: "Independent",
      bullets: [
        "Partnering with clients to define product goals, user needs, and visual identity for digital products.",
        "Handling the end-to-end design process from discovery through developer handoff.",
        "Applying iterative design thinking to solve real business problems for startups and independent brands.",
      ],
    },
    {
      period: "Nov 2024 — March 2025",
      role: "Product Design Intern",
      org: "Baboons",
      bullets: [
        "Designed responsive landing pages, including the published Cafe de Snor site.",
        "Built component libraries and documented UI foundations across multiple client projects.",
        "Prepared hi-fi assets and specs for smooth design-to-dev handoff.",
        "Contributed to competitive research, weekly critiques, and interactive client prototypes.",
      ],
    },
  ];

  const projects = [
    {
      name: "Metibuy",
      tag: "Marketplace Redesign · Client work",
      blurb:
        "Redesigned the front end of a live marketplace where people shop and sellers run their own stores: landing page, shopping, checkout, seller tools and admin, built on the client's existing backend.",
      href: "/projects/metibuy",
    },
    {
      name: "PlayTime",
      tag: "Game-Time Tracker for Windows · Own product",
      blurb:
        "A Windows app that counts your hours in every game, not just Steam's. Designed and built the whole product: the desktop app, its design system, and the website that sells it.",
      href: "/projects/playtime",
    },
    {
      name: "Skeet",
      tag: "Video Editor in the Browser · Contract, 2 months",
      blurb:
        "UI/UX for a video editor that runs in a browser tab, with a real timeline, a colour suite, and an AI assistant that has already watched your footage. Designed alongside the developer building the app.",
      href: "/projects/skeet",
    },
  ];

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
                Resume
              </p>
            </BlurReveal>
            <BlurReveal delay={0.06}>
              <h1 className="text-h1 text-[#111111] mb-2">Peter Phiri</h1>
            </BlurReveal>
            <BlurReveal delay={0.12}>
              <p className="text-body text-[#111111]/70 uppercase tracking-wider mb-8">
                Product Designer · Lusaka, Zambia
              </p>
            </BlurReveal>

            <BlurReveal delay={0.18}>
              <div className="flex flex-wrap items-center gap-3 mb-8">
                {/* Download PDF — primary */}
                <a
                  href={RESUME_URL}
                  download
                  className="group relative overflow-hidden inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#111111] text-[13px] uppercase tracking-wider cursor-none"
                >
                  <span className="relative z-[1] text-[#f6f6f6]">
                    Download PDF
                  </span>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="relative z-[1] text-[#f6f6f6]"
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

                {/* Email — secondary */}
                <a
                  href="mailto:peter.business.203@gmail.com"
                  className="group relative overflow-hidden inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#111111]/[0.06] text-[13px] uppercase tracking-wider cursor-none"
                >
                  <span className="absolute inset-0 bg-[#111111] transform scale-x-0 origin-left transition-transform duration-400 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-x-100" />
                  <span className="relative z-[1] text-[#111111] transition-colors duration-300 delay-100 group-hover:text-[#f6f6f6]">
                    peter.business.203@gmail.com
                  </span>
                </a>
              </div>
            </BlurReveal>

            <BlurReveal delay={0.24}>
              <div className="flex flex-wrap gap-x-8 gap-y-2 text-[13px] text-[#111111]/70">
                <span>
                  <span className="text-[#111111]/40 uppercase tracking-wider text-[11px] mr-2">
                    Phone
                  </span>
                  +260 767 489 892
                </span>
              </div>
            </BlurReveal>
          </div>
        </section>

        {/* ─── About ─── */}
        <section className="py-10 md:py-14 px-6 md:px-12 border-t border-[#111111]/10">
          <div className="max-w-[1000px] mx-auto grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 md:gap-16">
            <BlurReveal>
              <p className="text-[14px] tracking-[0.15em] uppercase text-[#111111]/50">
                About
              </p>
            </BlurReveal>
            <BlurReveal delay={0.1}>
              <p className="text-body text-[#111111]/80">
                Product designer and front-end developer based in Lusaka. I
                design interfaces and build them myself, from the first
                wireframe to a shipped product: a marketplace redesign for a
                client, a Windows game tracker I designed and built end to
                end, and the interface of a browser-based video editor. I care
                about clear hierarchy, design systems that hold up in code,
                and details that survive the build. Open to freelance projects
                and full-time roles.
              </p>
            </BlurReveal>
          </div>
        </section>

        {/* ─── Skills ─── */}
        <section className="py-10 md:py-14 px-6 md:px-12 border-t border-[#111111]/10">
          <div className="max-w-[1000px] mx-auto grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 md:gap-16">
            <BlurReveal>
              <p className="text-[14px] tracking-[0.15em] uppercase text-[#111111]/50">
                Skills
              </p>
            </BlurReveal>
            <div className="flex flex-col gap-6">
              {skills.map((group, gi) => (
                <BlurReveal key={group.label} delay={0.1 + gi * 0.06}>
                  <div>
                    <p className="text-[12px] tracking-[0.15em] uppercase text-[#111111]/50 mb-3">
                      {group.label}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {group.items.map((item) => (
                        <span
                          key={item}
                          className="inline-flex items-center px-3 py-1.5 rounded-full bg-[#111111]/[0.04] border border-[#111111]/10 text-[13px] text-[#111111]"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </BlurReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Frontend ─── */}
        <section className="py-10 md:py-14 px-6 md:px-12 border-t border-[#111111]/10">
          <div className="max-w-[1000px] mx-auto grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 md:gap-16">
            <BlurReveal>
              <p className="text-[14px] tracking-[0.15em] uppercase text-[#111111]/50">
                Frontend
              </p>
            </BlurReveal>

            <div className="flex flex-col gap-6">
              <BlurReveal delay={0.1}>
                <p className="text-body text-[#111111]/80 max-w-[640px]">
                  I&apos;m a product designer first. I use AI like any other
                  tool — I drive it, review what it produces, and own the
                  architectural decisions. So the projects below are mine
                  end-to-end, from Figma to deploy.
                </p>
              </BlurReveal>

              {[
                { label: "Core", items: ["TypeScript", "React", "Next.js"] },
                {
                  label: "UI",
                  items: ["Tailwind CSS", "Design tokens", "Responsive layouts"],
                },
                {
                  label: "Motion",
                  items: ["GSAP", "Lenis", "Lottie", "Framer Motion"],
                },
                {
                  label: "State & Data",
                  items: ["Zustand", "REST", "GraphQL"],
                },
                { label: "Tooling", items: ["Git", "Vercel"] },
              ].map((group, gi) => (
                <BlurReveal key={group.label} delay={0.18 + gi * 0.06}>
                  <div>
                    <p className="text-[12px] tracking-[0.15em] uppercase text-[#111111]/50 mb-3">
                      {group.label}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {group.items.map((item) => (
                        <span
                          key={item}
                          className="inline-flex items-center px-3 py-1.5 rounded-full bg-[#111111]/[0.04] border border-[#111111]/10 text-[13px] text-[#111111]"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </BlurReveal>
              ))}

              <BlurReveal delay={0.5}>
                <p className="text-[13px] text-[#111111]/55 italic">
                  Currently learning — accessibility (keyboard, ARIA,
                  reduced-motion) and testing with React Testing Library.
                </p>
              </BlurReveal>
            </div>
          </div>
        </section>

        {/* ─── Experience ─── */}
        <section className="py-10 md:py-14 px-6 md:px-12 border-t border-[#111111]/10">
          <div className="max-w-[1000px] mx-auto grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 md:gap-16">
            <BlurReveal>
              <p className="text-[14px] tracking-[0.15em] uppercase text-[#111111]/50">
                Experience
              </p>
            </BlurReveal>

            <ol className="relative border-l border-[#111111]/15 ml-3">
              {experience.map((item, i) => (
                <BlurReveal key={item.role} delay={0.1 + i * 0.08}>
                  <li className={`relative pl-8 ${i > 0 ? "mt-8" : ""}`}>
                    <span className="absolute -left-[7px] top-[6px] w-3 h-3 rounded-full bg-[#111111]" />
                    <p className="text-[12px] tracking-[0.15em] uppercase text-[#111111]/50 mb-1">
                      {item.period}
                    </p>
                    <h3 className="text-[24px] leading-[1.2] font-medium text-[#111111] mb-1">
                      {item.role}
                    </h3>
                    <p className="text-body text-[#111111]/60 mb-3">
                      {item.org}
                    </p>
                    <ul className="space-y-2">
                      {item.bullets.map((b, bi) => (
                        <li
                          key={bi}
                          className="text-body text-[#111111]/80 relative pl-5 before:content-[''] before:absolute before:left-0 before:top-[0.7em] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#111111]/40"
                        >
                          {b}
                        </li>
                      ))}
                    </ul>
                  </li>
                </BlurReveal>
              ))}
            </ol>
          </div>
        </section>

        {/* ─── Projects ─── */}
        <section className="py-10 md:py-14 px-6 md:px-12 border-t border-[#111111]/10">
          <div className="max-w-[1000px] mx-auto grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 md:gap-16">
            <BlurReveal>
              <p className="text-[14px] tracking-[0.15em] uppercase text-[#111111]/50">
                Selected Projects
              </p>
            </BlurReveal>

            <div className="flex flex-col gap-8">
              {projects.map((p, i) => (
                <BlurReveal key={p.name} delay={0.08 + i * 0.06}>
                  <a
                    href={p.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block p-6 rounded-[20px] bg-white hover:bg-[#111111] transition-colors duration-300 cursor-none"
                  >
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className="text-[22px] leading-[1.2] font-medium text-[#111111] group-hover:text-[#f6f6f6] transition-colors duration-300">
                        {p.name}
                      </h3>
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        className="mt-1 shrink-0 text-[#111111]/40 group-hover:text-[#f6f6f6] transition-colors duration-300"
                      >
                        <path
                          d="M7 17 L17 7 M8 7 H17 V16"
                          stroke="currentColor"
                          strokeWidth="1.75"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <p className="text-[12px] tracking-[0.15em] uppercase text-[#111111]/50 group-hover:text-[#f6f6f6]/60 mb-3 transition-colors duration-300">
                      {p.tag}
                    </p>
                    <p className="text-body text-[#111111]/80 group-hover:text-[#f6f6f6]/85 transition-colors duration-300">
                      {p.blurb}
                    </p>
                  </a>
                </BlurReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Close CTA ─── */}
        <section className="py-24 md:py-32 px-6 md:px-12 border-t border-[#111111]/10">
          <div className="max-w-[900px] mx-auto flex flex-col items-center text-center">
            <BlurReveal>
              <h2
                className="text-[#111111] uppercase text-[36px] md:text-[48px] leading-[1.1] md:leading-[54px]"
                style={{ fontWeight: 400 }}
              >
                Like what you see?<br />
                Let&apos;s work together.
              </h2>
            </BlurReveal>
            <BlurReveal delay={0.1}>
              <a
                href="mailto:peter.business.203@gmail.com"
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
            </BlurReveal>
          </div>
        </section>
      </main>

      <Footer highlight={socialsHighlight} />
    </>
  );
}
