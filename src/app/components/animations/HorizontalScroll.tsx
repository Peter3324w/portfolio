"use client";

import { useEffect, useRef, useState } from "react";

interface HorizontalScrollProps {
  count?: number;
}

export default function HorizontalScroll({ count = 5 }: HorizontalScrollProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const section = sectionRef.current;
      const track = trackRef.current;
      if (!section || !track) return;
      const rect = section.getBoundingClientRect();
      const total = section.offsetHeight - window.innerHeight;
      const scrolled = Math.min(total, Math.max(0, -rect.top));
      const progress = total > 0 ? scrolled / total : 0;
      const travel = track.scrollWidth - window.innerWidth;
      setOffset(progress * travel);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      ref={sectionRef}
      className="relative"
      style={{ height: `${count * 80}vh` }}
    >
      <div className="sticky top-0 h-screen overflow-hidden flex flex-col justify-center pt-24">
        <h2 className="text-h2 text-[#111111] px-12 mb-12">My Skills</h2>
        <div
          ref={trackRef}
          className="flex gap-8 pl-12 will-change-transform"
          style={{ transform: `translate3d(${-offset}px, 0, 0)` }}
        >
          {Array.from({ length: count }).map((_, i) => (
            <div
              key={i}
              className="shrink-0 rounded-[24px] bg-[#111111]/10"
              style={{ width: "404px", height: "505px" }}
            />
          ))}
          {/* trailing spacer so the last card can reach the left edge */}
          <div className="shrink-0 w-12" />
        </div>
      </div>
    </div>
  );
}
