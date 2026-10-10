"use client";

import { useRef } from "react";
import { FRAME, FRAME_GUTTER, LINE } from "./frame";
import { easeOutCubic, useMagneticPull } from "../../lib/useMagneticPull";

// Black wrapper for every home section from Featured Projects down. Draws the
// two frame rails over its whole height (above the content, like Attio's
// frame overlay) and tells the nav and cursor they're on a dark surface.
export default function DarkZone({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  // Drawn in at the chapter's edge. Slower and softer than the skills
  // section's pull: at 1s with an expo start it lurched.
  useMagneticPull(ref, { seconds: 1.8, easing: easeOutCubic });

  return (
    <div
      ref={ref}
      data-nav-dark
      data-cursor-theme="light"
      className="relative bg-black text-[#f6f6f6]"
    >
      {children}
      {/* The rails clear out with the text when the camera pushes into a
          project. */}
      <div
        aria-hidden
        data-push-fade
        className={`pointer-events-none absolute inset-0 z-[3] ${FRAME_GUTTER}`}
      >
        <div className={`${FRAME} h-full border-x ${LINE}`} />
      </div>
    </div>
  );
}
