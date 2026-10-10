"use client";

import { useEffect, type RefObject } from "react";
import { attachPrism } from "../../lib/prism";

// Puts the Prism cursor effect over the image inside `ref` (the first <img>
// that isn't the camera push's blurred stand-in).
export function usePrism(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const img = ref.current?.querySelector<HTMLImageElement>("img:not([data-push-soft])");
    if (!img) return;
    return attachPrism(img);
  }, [ref]);
}
