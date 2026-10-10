"use client";

import { useEffect, useRef } from "react";

interface ScrollLineProps {
  className?: string;
}

export default function ScrollLine({ className = "" }: ScrollLineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const leftPathRef = useRef<SVGCircleElement>(null);
  const rightPathRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const left = leftPathRef.current;
    const right = rightPathRef.current;
    if (!container || !left || !right) return;

    const leftLen = left.getTotalLength();
    const rightLen = right.getTotalLength();
    left.style.strokeDasharray = `${leftLen}`;
    right.style.strokeDasharray = `${rightLen}`;

    const onScroll = () => {
      const rect = container.getBoundingClientRect();
      const windowH = window.innerHeight;
      const progress = Math.min(
        1,
        Math.max(0, (windowH - rect.top) / (windowH + rect.height))
      );
      left.style.strokeDashoffset = `${leftLen * (1 - progress)}`;
      right.style.strokeDashoffset = `${rightLen * (1 - progress)}`;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const stroke = 56;
  const r = 320;
  const size = (r + stroke) * 2;
  const c = size / 2;

  return (
    <div
      ref={containerRef}
      className={`pointer-events-none absolute inset-0 ${className}`}
    >
      {/* Left circle — bleeds in from the left edge */}
      <svg
        className="absolute top-[60%] -translate-y-1/2"
        style={{ left: `-${c + 20}px` }}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        fill="none"
      >
        {/* rotate 180° so path start sits opposite the visible arc, matching right circle's timing */}
        <circle
          ref={leftPathRef}
          cx={c}
          cy={c}
          r={r}
          stroke="#111111"
          strokeOpacity="0.3"
          strokeWidth={stroke}
          strokeLinecap="round"
          transform={`rotate(180 ${c} ${c})`}
        />
      </svg>

      {/* Right circle — bleeds in from the right edge */}
      <svg
        className="absolute top-1/2 -translate-y-1/2"
        style={{ right: `-${c + 20}px` }}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        fill="none"
      >
        <circle
          ref={rightPathRef}
          cx={c}
          cy={c}
          r={r}
          stroke="#111111"
          strokeOpacity="0.3"
          strokeWidth={stroke}
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
