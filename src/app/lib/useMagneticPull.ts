"use client";

import { useEffect, type RefObject } from "react";
import { getLenis } from "./lenis";

// A magnetic entry, after Vertex Lab's night band: once the element's top edge
// has climbed past `at` (a fraction of the viewport) on a downward scroll, the
// page stops waiting and carries the visitor the rest of the way in, wheel
// locked for the duration — that's what makes it a pull rather than a
// suggestion. Scrolling back up is never driven, and the pull only re-arms
// once the edge is well clear of the screen again, so doubling back can't yank
// you through the same move twice.
//
// Reduced-motion visitors have no Lenis instance, so they get no pull.

const REARM_AT = 0.95;

// Quick off the mark, long settle — reads as being drawn in rather than
// animated to.
export const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));
// A softer start than expo: a quarter of the way in the first tenth instead
// of half.
export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

export function useMagneticPull(
  ref: RefObject<HTMLElement | null>,
  {
    at = 0.7,
    seconds = 1,
    easing = easeOutExpo,
    // Extra pixels past the element's top edge to land on, measured when the
    // pull fires (sections that pin use it to land on their resting framing).
    landing,
  }: {
    at?: number;
    seconds?: number;
    easing?: (t: number) => number;
    landing?: (el: HTMLElement) => number;
  } = {}
) {
  useEffect(() => {
    let raf = 0;
    let lastY = window.scrollY;
    // Starts disarmed: landing mid-page shouldn't fire a pull before the
    // visitor has scrolled at all.
    let armed = false;

    const update = () => {
      const el = ref.current;
      const lenis = getLenis();
      if (!el || !lenis || window.innerWidth < 768) return;

      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const y = window.scrollY;
      const goingDown = y > lastY;
      lastY = y;

      if (rect.top > vh * REARM_AT) {
        armed = true;
      } else if (armed && goingDown && rect.top > 0 && rect.top < vh * at) {
        armed = false;
        lenis.scrollTo(y + rect.top + (landing?.(el) ?? 0), {
          duration: seconds,
          easing,
          lock: true,
        });
      }
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [ref, at, seconds, easing, landing]);
}
