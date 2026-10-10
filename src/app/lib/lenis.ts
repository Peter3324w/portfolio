import type Lenis from "lenis";

// The live Lenis instance, registered by SmoothScroll. Anything that wants to
// drive the page (rather than just react to it) has to go through Lenis —
// window.scrollTo would be fought by the smooth-scroll loop. Null for
// reduced-motion visitors, so callers treat a missing instance as "don't move
// the page".
let instance: Lenis | null = null;

export function setLenis(next: Lenis | null) {
  instance = next;
}

export function getLenis() {
  return instance;
}
