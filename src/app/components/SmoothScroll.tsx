"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { setLenis } from "../lib/lenis";

export default function SmoothScroll() {
  useEffect(() => {
    // Force scroll to top on page load
    window.scrollTo(0, 0);
    if (window.history.scrollRestoration) {
      window.history.scrollRestoration = "manual";
    }

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    lenis.scrollTo(0, { immediate: true });
    // Published so sections can drive the page (see the pull in
    // SkillsAndCtaSection); reduced-motion visitors get no instance.
    setLenis(reduced ? null : lenis);

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      setLenis(null);
      lenis.destroy();
    };
  }, []);

  return null;
}
