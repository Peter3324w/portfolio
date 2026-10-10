"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import LoadingScreen from "../LoadingScreen";
import Nav from "../Nav";
import Footer from "../Footer";
import HeroSection from "./HeroSection";
import { scrollToSocialsFooter } from "../utils";
import { peekPendingReturn } from "../../lib/cameraPush";
import { PROJECTS } from "../../lib/home-data";

// Module-level scroll memory: persists across client-side nav (so Home restores
// its scroll when returning from /about) but resets on hard reload (so a
// refresh starts at the top, matching the LoadingScreen behaviour).
let savedHomeScrollY = 0;

export default function HomeShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loadingDone, setLoadingDone] = useState(false);
  const [overFooter, setOverFooter] = useState(false);
  // True while a black section ([data-nav-dark]) sits under the nav bar, so
  // the nav can switch to its dark treatment before the footer is reached.
  const [overDark, setOverDark] = useState(false);
  const [socialsHighlight, setSocialsHighlight] = useState(0);
  const mainRef = useRef<HTMLElement>(null);

  // Prefetch project pages so the click-transition doesn't stall on first nav.
  useEffect(() => {
    PROJECTS.filter((p) => !p.comingSoon).forEach(({ slug }) =>
      router.prefetch(`/projects/${slug}`)
    );
  }, [router]);

  useEffect(() => {
    const onScroll = () => {
      const main = mainRef.current;
      if (main) {
        const mainBottom = main.offsetTop + main.offsetHeight;
        setOverFooter(window.scrollY + 64 > mainBottom);
      }
      // Any dark surface under the bar: the black chapter, or the
      // fly-through's stage while the camera is in its corridor (the stage
      // says "off" the rest of the time).
      const darks = document.querySelectorAll<HTMLElement>(
        '[data-nav-dark]:not([data-nav-dark="off"])'
      );
      setOverDark(
        Array.from(darks).some((el) => {
          const r = el.getBoundingClientRect();
          return r.top < 36 && r.bottom > 36;
        })
      );
      savedHomeScrollY = window.scrollY;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    // The fly-through flips its stage between light and dark mid-scroll.
    window.addEventListener("navdark", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("navdark", onScroll);
    };
  }, []);

  // Restore scroll position on mount (runs after layout so heights are known).
  // A "pendingScroll" flag (set by Nav when navigating here from another page)
  // takes priority over the saved position.
  useEffect(() => {
    // Coming back from a case study, the camera pull-out decides where the
    // page sits (see useCameraPush).
    if (peekPendingReturn()) return;
    const target = sessionStorage.getItem("pendingScroll");
    if (target) {
      sessionStorage.removeItem("pendingScroll");
      savedHomeScrollY = 0;
      requestAnimationFrame(() => {
        document
          .getElementById(target)
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      return;
    }
    if (savedHomeScrollY <= 0) return;
    requestAnimationFrame(() => {
      window.scrollTo(0, savedHomeScrollY);
    });
  }, []);

  return (
    <>
      <LoadingScreen onComplete={() => setLoadingDone(true)} />

      <Nav
        loadingDone={loadingDone}
        overFooter={overFooter || overDark}
        onSocialsClick={() =>
          scrollToSocialsFooter(() => setSocialsHighlight((v) => v + 1))
        }
      />

      <main
        ref={mainRef}
        className={`relative z-[2] bg-[#f6f6f6] mb-[calc(100vh+140px)] w-full max-w-[100vw] ${
          overFooter ? "pointer-events-none" : ""
        }`}
      >
        <HeroSection loadingDone={loadingDone} />
        {children}
      </main>

      <Footer highlight={socialsHighlight} />
    </>
  );
}
