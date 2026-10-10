"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import Image from "next/image";

const MENU_EASE = "cubic-bezier(0.23, 1, 0.32, 1)";
// How far the open menu reaches past the pills on its top row.
const MENU_PAD = 6;

interface NavProps {
  loadingDone?: boolean;
  overFooter: boolean;
  onSocialsClick: () => void;
  // Dark-page variant: fully transparent nav with light text, no button
  // pills, no hover fills. Used on case-study / project pages.
  transparent?: boolean;
}

export default function Nav({
  loadingDone = true,
  overFooter,
  onSocialsClick,
  transparent = false,
}: NavProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  // When the case-study ribbon's light next-project panel slides under a
  // button, that button's transparent-mode colours flip to dark. Tracked per
  // button: the panel reaches Menu before it reaches Let's Talk.
  const [overPanel, setOverPanel] = useState({ talk: false, menu: false });
  const talkRef = useRef<HTMLAnchorElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  // The Menu pill's size (the closed menu is clipped to exactly this box)
  // and the width of the whole button row the open menu wraps.
  const [pill, setPill] = useState({ w: 120, h: 40, row: 120 });

  useEffect(() => {
    const button = menuButtonRef.current;
    const row = menuRef.current;
    if (!button || !row) return;
    const ro = new ResizeObserver(() =>
      setPill({ w: button.offsetWidth, h: button.offsetHeight, row: row.offsetWidth })
    );
    ro.observe(button);
    ro.observe(row);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Self-checks against [data-next-tile-panel] — no cross-component event
  // timing, Nav owns the detection. A button counts as covered once the
  // panel is under its centre.
  useEffect(() => {
    if (!transparent) return;
    let raf = 0;
    const covered = (panel: DOMRect | undefined, el: HTMLElement | null) => {
      if (!panel || !el?.offsetParent) return false;
      const r = el.getBoundingClientRect();
      const x = r.left + r.width / 2;
      const y = r.top + r.height / 2;
      return x > panel.left && x < panel.right && y > panel.top && y < panel.bottom;
    };
    // Phones give the transparent nav a dark bar of its own, so the light
    // panel never shows through it and the colours must not flip.
    const phone = window.matchMedia("(max-width: 767px)");
    const check = () => {
      if (phone.matches) {
        setOverPanel((p) => (p.talk || p.menu ? { talk: false, menu: false } : p));
        return;
      }
      const panel = document
        .querySelector<HTMLElement>("[data-next-tile-panel]")
        ?.getBoundingClientRect();
      const talk = covered(panel, talkRef.current);
      const menu = covered(panel, menuButtonRef.current);
      setOverPanel((p) =>
        p.talk === talk && p.menu === menu ? p : { talk, menu }
      );
    };
    // The ribbon moves the panel in the frame after a scroll (and the
    // over-scroll meter leans it in on wheel), so read it a frame later.
    const schedule = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = requestAnimationFrame(() => {
          raf = 0;
          check();
        });
      });
    };
    check();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("wheel", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("wheel", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [transparent]);

  useEffect(() => {
    if (!menuOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  // Options drop in one after another once the surface has started to
  // open, and all leave together on close.
  const itemMotion = (i: number): CSSProperties => ({
    opacity: menuOpen ? 1 : 0,
    transform: menuOpen ? "translateY(0)" : "translateY(-6px)",
    transition: menuOpen
      ? `opacity 350ms ease ${110 + i * 40}ms, transform 600ms ${MENU_EASE} ${110 + i * 40}ms`
      : "opacity 150ms ease, transform 150ms ease",
  });

  // The surface grows out of the pill in the colour its hover fill used to
  // be: dark over light sections, light over dark ones.
  const lightBehind = transparent ? overPanel.menu : !overFooter;
  const ink = lightBehind
    ? {
        surface: "bg-[#111111]",
        fill: "bg-[#f6f6f6]",
        text: "text-[#f6f6f6] group-hover:text-[#111111]",
      }
    : {
        surface: "bg-[#f6f6f6]",
        fill: "bg-[#111111]",
        text: "text-[#111111] group-hover:text-[#f6f6f6]",
      };
  // The pill's label sits on the page when closed and on the surface when open.
  const pillTextLight = menuOpen ? lightBehind : transparent && !overPanel.menu;
  // Let's Talk: on the page when closed; inside the open menu it becomes a
  // filled pill in the surface's opposite colour — black on the light one.
  const talk = menuOpen
    ? lightBehind
      ? { bg: "bg-[#f6f6f6]", fill: "bg-[#111111]", text: "text-[#111111] group-hover:text-[#f6f6f6]" }
      : { bg: "bg-[#111111]", fill: "bg-[#f6f6f6]", text: "text-[#f6f6f6] group-hover:text-[#111111]" }
    : transparent
      ? overPanel.talk
        ? { bg: "", fill: "bg-[#111111]", text: "text-[#111111] group-hover:text-[#f6f6f6]" }
        : { bg: "", fill: "bg-[#f6f6f6]", text: "text-[#f6f6f6] group-hover:text-[#111111]" }
      : overFooter
        ? { bg: "bg-[#f6f6f6]", fill: "", text: "text-[#111111]" }
        : { bg: "", fill: "bg-[#111111]", text: "text-[#111111] group-hover:text-[#f6f6f6]" };

  const items: Array<{
    label: string;
    kind: "link" | "socials" | "scroll" | "placeholder";
    href?: string;
    target?: string;
  }> = [
    { label: "Home", kind: "link", href: "/" },
    { label: "Resume", kind: "link", href: "/resume" },
    { label: "Projects", kind: "scroll", target: "projects" },
    { label: "About", kind: "link", href: "/about" },
    { label: "Content", kind: "link", href: "/content-creation" },
    { label: "Socials", kind: "socials" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 w-full px-6 md:px-12 py-4 transition-all duration-500 ${
        overFooter && !transparent
          ? "backdrop-blur-md bg-black/70 max-md:bg-black/90 shadow-[inset_0_-1px_0_rgba(255,255,255,0.08)]"
          : scrolled && !transparent
            ? "backdrop-blur-md bg-[#f6f6f6]/60 max-md:bg-[#f6f6f6]/90"
            : transparent
              ? // Phones: content scrolls under the bar, so it gets a dark
                // surface instead of floating light text over the images.
                "bg-transparent max-md:bg-[#0a0a0a]/90 max-md:backdrop-blur-md"
              : "bg-transparent max-md:bg-[#f6f6f6]/90 max-md:backdrop-blur-md"
      }`}
      style={{
        opacity: loadingDone ? 1 : 0,
        pointerEvents: loadingDone ? "auto" : "none",
      }}
    >
      <div className="flex items-center justify-between max-w-[1296px] mx-auto">
        {/* Logo */}
        <div>
          <Link
            href="/"
            onClick={(e) => {
              if (typeof window !== "undefined" && window.location.pathname === "/") {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
            className="text-body uppercase transition-colors duration-300 cursor-none"
            style={{
              fontSize: "18px",
              color: overFooter || transparent ? "#f6f6f6" : "#111111",
            }}
          >
            Peter Phiri
          </Link>
        </div>

        {/* Nav actions — the open menu is one surface behind this whole
            row, so Let's Talk ends up inside it. */}
        <div
          ref={menuRef}
          className="relative flex items-center gap-[20px]"
          onPointerLeave={(e) => {
            if (e.pointerType === "mouse") setMenuOpen(false);
          }}
        >
          {/* Let's Talk */}
          <a
            ref={talkRef}
            href="mailto:peter.business.203@gmail.com"
            className={`max-md:hidden group relative z-[1] overflow-hidden rounded-[24px] flex items-center justify-center gap-[16px] uppercase tracking-wide text-sm cursor-none px-4 py-2 transition-colors duration-300 ${
              menuOpen ? "delay-100" : ""
            } ${talk.bg}`}
          >
            {talk.fill && (
              <span className={`absolute inset-0 ${talk.fill} transform scale-x-0 origin-left transition-transform duration-400 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-x-100`} />
            )}
            <span className={`relative z-[1] transition-colors duration-300 delay-100 ${talk.text}`}>
              Let&apos;s Talk
            </span>
          </a>

          {/* Menu — the dropdown grows out of this pill: closed it's
              clipped to the pill's own box, open it unclips down and to the
              left, around Let's Talk, and the options drop in. */}
          <div
            className="relative"
            onPointerEnter={(e) => {
              if (e.pointerType === "mouse") setMenuOpen(true);
            }}
          >
            <button
              ref={menuButtonRef}
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-haspopup="true"
              className={`relative z-[1] rounded-[24px] flex items-center gap-[16px] uppercase tracking-wide text-sm cursor-none px-4 py-2 transition-colors duration-300 ${
                overFooter && !transparent ? "bg-[#f6f6f6]" : ""
              }`}
            >
              {/* On close the label waits for the surface to shrink back
                  under it before switching colour. */}
              <span
                className={`transition-colors duration-200 ${menuOpen ? "" : "delay-[250ms]"} ${
                  pillTextLight ? "text-[#f6f6f6]" : "text-[#111111]"
                }`}
              >
                Menu
              </span>
              <Image
                className={`transition-[filter,rotate] duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${
                  menuOpen ? "rotate-90" : "delay-[250ms]"
                } ${pillTextLight ? "invert" : ""}`}
                src="/images/icon-menu-dots.svg"
                alt=""
                width={24}
                height={24}
              />
            </button>
          </div>

          {/* The drop shadow lives on a wrapper so it follows the clip. */}
          <div
            className="absolute transition-[filter] duration-500"
            style={{
              top: -MENU_PAD,
              right: -MENU_PAD,
              filter: menuOpen
                ? "drop-shadow(0 20px 24px rgba(0,0,0,0.16))"
                : "drop-shadow(0 0 0 rgba(0,0,0,0))",
              pointerEvents: menuOpen ? "auto" : "none",
            }}
          >
            <div
              inert={!menuOpen}
              className={`pb-2 transition-colors duration-300 ${ink.surface}`}
              style={{
                width: Math.max(220, pill.row + MENU_PAD * 2),
                opacity: menuOpen ? 1 : 0,
                clipPath: menuOpen
                  ? `inset(0 round ${pill.h / 2 + MENU_PAD}px)`
                  : `inset(${MENU_PAD}px ${MENU_PAD}px calc(100% - ${pill.h + MENU_PAD}px) calc(100% - ${pill.w + MENU_PAD}px) round ${pill.h / 2}px)`,
                transition: menuOpen
                  ? `clip-path 650ms ${MENU_EASE}, opacity 120ms linear`
                  : `clip-path 450ms ${MENU_EASE}, opacity 200ms linear 250ms`,
              }}
            >
              {/* The buttons' row; the real buttons sit on top of it. */}
              <div aria-hidden style={{ height: pill.h + MENU_PAD * 2 }} />
              {/* Let's Talk — mobile only (desktop has it as a standalone pill) */}
              <a
                href="mailto:peter.business.203@gmail.com"
                onClick={() => setMenuOpen(false)}
                className="md:hidden group relative block overflow-hidden px-[22px] py-3 uppercase tracking-wide text-sm cursor-none"
                style={itemMotion(0)}
              >
                <span className={`absolute inset-0 ${ink.fill} transform scale-x-0 origin-left transition-transform duration-400 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-x-100`} />
                <span className={`relative z-[1] ${ink.text} transition-colors duration-300 delay-100`}>
                  Let&apos;s Talk
                </span>
              </a>
              {items.map((item, i) => {
                const base = `group relative block overflow-hidden px-[22px] py-3 uppercase tracking-wide text-sm cursor-none`;

                const inner = (
                  <>
                    <span className={`absolute inset-0 ${ink.fill} transform scale-x-0 origin-left transition-transform duration-400 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-x-100`} />
                    <span className={`relative z-[1] ${ink.text} transition-colors duration-300 delay-100`}>
                      {item.label}
                    </span>
                  </>
                );

                if (item.kind === "link" && item.href) {
                  const isHome = item.href === "/";
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      scroll={!isHome}
                      onClick={(e) => {
                        setMenuOpen(false);
                        if (
                          isHome &&
                          typeof window !== "undefined" &&
                          window.location.pathname === "/"
                        ) {
                          e.preventDefault();
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }
                      }}
                      className={base}
                      style={itemMotion(i + 1)}
                    >
                      {inner}
                    </Link>
                  );
                }

                if (item.kind === "socials") {
                  return (
                    <a
                      key={item.label}
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setMenuOpen(false);
                        onSocialsClick();
                      }}
                      className={base}
                      style={itemMotion(i + 1)}
                    >
                      {inner}
                    </a>
                  );
                }

                if (item.kind === "scroll" && item.target) {
                  const target = item.target;
                  return (
                    <Link
                      key={item.label}
                      href="/"
                      scroll={false}
                      onClick={(e) => {
                        setMenuOpen(false);
                        if (window.location.pathname === "/") {
                          e.preventDefault();
                          document
                            .getElementById(target)
                            ?.scrollIntoView({ behavior: "smooth", block: "start" });
                        } else {
                          sessionStorage.setItem("pendingScroll", target);
                        }
                      }}
                      className={base}
                      style={itemMotion(i + 1)}
                    >
                      {inner}
                    </Link>
                  );
                }

                return (
                  <a key={item.label} href="#" className={base} style={itemMotion(i + 1)}>
                    {inner}
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
