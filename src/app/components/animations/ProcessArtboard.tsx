"use client";

import { useEffect, useRef } from "react";

// The same screen, redrawn at the fidelity of whichever process step is
// open: scattered research notes → boxes and flows → a wireframe → the
// shipped UI. Stages 03 and 04 share their geometry on purpose, so the last
// step reads as the wireframe finished rather than a different picture.
//
// Stage visibility is inline (it must work even if a stylesheet lags); the
// looping motion lives in globals.css as .pa-twinkle / .pa-spark / .pa-sweep.

const WHITE = "#f6f6f6";

function Stage({
  on,
  children,
}: {
  on: boolean;
  children: React.ReactNode;
}) {
  return (
    <g
      style={{
        opacity: on ? 1 : 0,
        transform: on ? "none" : "translateY(10px)",
        transformBox: "fill-box",
        transformOrigin: "center",
        transition:
          "opacity 0.55s ease, transform 0.55s cubic-bezier(0.23,1,0.32,1)",
        pointerEvents: "none",
      }}
    >
      {children}
    </g>
  );
}

// 01 — Understand: notes, quotes and observations, not yet connected.
const NOTES: Array<[number, number, number]> = [
  [72, 92, 54],
  [168, 70, 0],
  [232, 104, 62],
  [320, 84, 0],
  [96, 168, 0],
  [178, 156, 70],
  [286, 182, 0],
  [74, 250, 46],
  [166, 244, 0],
  [252, 266, 58],
  [330, 240, 0],
  [118, 330, 64],
  [226, 344, 0],
  [310, 322, 40],
];

function Understand({ on }: { on: boolean }) {
  return (
    <Stage on={on}>
      {NOTES.map(([x, y, w], i) => (
        <g key={i}>
          <circle
            cx={x}
            cy={y}
            r="2.5"
            fill={WHITE}
            opacity="0.55"
            className="pa-twinkle"
            style={{ animationDelay: `${(i % 7) * 0.55}s` }}
          />
          {w > 0 && (
            <line
              x1={x + 10}
              y1={y}
              x2={x + 10 + w}
              y2={y}
              stroke={WHITE}
              strokeOpacity="0.16"
              strokeWidth="1"
            />
          )}
        </g>
      ))}
    </Stage>
  );
}

// 02 — Define: the notes resolve into blocks and a flow between them.
const BOXES = [
  { x: 52, y: 76, w: 126, h: 66 },
  { x: 242, y: 60, w: 126, h: 66 },
  { x: 140, y: 196, w: 140, h: 72 },
  { x: 150, y: 320, w: 120, h: 58 },
];
const FLOWS = [
  "M178 109 H242",
  "M115 142 V172 Q115 196 172 196",
  "M305 126 V172 Q305 196 248 196",
  "M210 268 V320",
];

function Define({ on }: { on: boolean }) {
  return (
    <Stage on={on}>
      {FLOWS.map((d, i) => (
        <g key={d}>
          <path
            d={d}
            fill="none"
            stroke={WHITE}
            strokeOpacity="0.18"
            strokeWidth="1"
          />
          <path
            d={d}
            fill="none"
            stroke={WHITE}
            strokeOpacity="0.85"
            strokeWidth="1.4"
            strokeLinecap="round"
            className="pa-spark"
            style={{ animationDelay: `${i * 0.7}s` }}
          />
        </g>
      ))}
      {BOXES.map((b, i) => (
        <g key={i}>
          <rect
            x={b.x}
            y={b.y}
            width={b.w}
            height={b.h}
            rx="6"
            fill="none"
            stroke={WHITE}
            strokeOpacity="0.28"
          />
          <line
            x1={b.x + 16}
            y1={b.y + 24}
            x2={b.x + b.w - 40}
            y2={b.y + 24}
            stroke={WHITE}
            strokeOpacity="0.2"
          />
          <line
            x1={b.x + 16}
            y1={b.y + 40}
            x2={b.x + b.w - 22}
            y2={b.y + 40}
            stroke={WHITE}
            strokeOpacity="0.12"
          />
        </g>
      ))}
    </Stage>
  );
}

// Shared geometry for 03 and 04 — the same screen, twice.
const ART = { x: 66, y: 54, w: 288, h: 312, r: 10 };
const TEXT_BARS = [
  { x: 92, y: 126, width: 128, height: 9 },
  { x: 92, y: 146, width: 172, height: 9 },
  { x: 92, y: 166, width: 96, height: 9 },
];
const TILES = [
  { x: 92, y: 200, width: 112, height: 84 },
  { x: 218, y: 200, width: 112, height: 84 },
];

function Chrome({ dim }: { dim: number }) {
  return (
    <>
      <rect
        x={ART.x}
        y={ART.y}
        width={ART.w}
        height={ART.h}
        rx={ART.r}
        fill="none"
        stroke={WHITE}
        strokeOpacity={dim}
      />
      <line
        x1={ART.x}
        y1={ART.y + 34}
        x2={ART.x + ART.w}
        y2={ART.y + 34}
        stroke={WHITE}
        strokeOpacity={dim * 0.7}
      />
    </>
  );
}

// 03 — Design: structure only, everything still an outline.
function Wireframe({ on }: { on: boolean }) {
  return (
    <Stage on={on}>
      <Chrome dim={0.26} />
      {[0, 1, 2].map((i) => (
        <circle
          key={i}
          cx={ART.x + 20 + i * 12}
          cy={ART.y + 17}
          r="3"
          fill="none"
          stroke={WHITE}
          strokeOpacity="0.22"
        />
      ))}
      {TEXT_BARS.map((b) => (
        <rect
          key={b.y}
          {...b}
          rx="4"
          fill="none"
          stroke={WHITE}
          strokeOpacity="0.22"
        />
      ))}
      {TILES.map((t) => (
        <g key={t.x}>
          <rect
            {...t}
            rx="6"
            fill="none"
            stroke={WHITE}
            strokeOpacity="0.22"
          />
          <path
            d={`M${t.x} ${t.y} L${t.x + t.width} ${t.y + t.height} M${t.x + t.width} ${t.y} L${t.x} ${t.y + t.height}`}
            stroke={WHITE}
            strokeOpacity="0.1"
          />
        </g>
      ))}
      <rect
        x="92"
        y="304"
        width="96"
        height="28"
        rx="14"
        fill="none"
        stroke={WHITE}
        strokeOpacity="0.28"
      />
    </Stage>
  );
}

// 04 — Refine & Ship: the same screen with weight, colour and a live sweep.
function Shipped({ on }: { on: boolean }) {
  return (
    <Stage on={on}>
      <defs>
        <clipPath id="pa-art">
          <rect
            x={ART.x}
            y={ART.y}
            width={ART.w}
            height={ART.h}
            rx={ART.r}
          />
        </clipPath>
        <linearGradient id="pa-sweep-grad" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor={WHITE} stopOpacity="0" />
          <stop offset="0.5" stopColor={WHITE} stopOpacity="0.14" />
          <stop offset="1" stopColor={WHITE} stopOpacity="0" />
        </linearGradient>
      </defs>

      <Chrome dim={0.42} />
      {[0, 1, 2].map((i) => (
        <circle
          key={i}
          cx={ART.x + 20 + i * 12}
          cy={ART.y + 17}
          r="3"
          fill={WHITE}
          opacity={i === 0 ? 0.75 : 0.25}
        />
      ))}
      {TEXT_BARS.map((b, i) => (
        <rect
          key={b.y}
          {...b}
          rx="4"
          fill={WHITE}
          opacity={i === 0 ? 0.5 : 0.22}
        />
      ))}
      {TILES.map((t, i) => (
        <rect
          key={t.x}
          {...t}
          rx="6"
          fill={WHITE}
          opacity={i === 0 ? 0.14 : 0.09}
        />
      ))}
      <rect x="92" y="304" width="96" height="28" rx="14" fill={WHITE} opacity="0.9" />
      <rect x="204" y="304" width="76" height="28" rx="14" fill="none" stroke={WHITE} strokeOpacity="0.3" />

      <g clipPath="url(#pa-art)">
        <rect
          x={ART.x - 140}
          y={ART.y}
          width="140"
          height={ART.h}
          fill="url(#pa-sweep-grad)"
          className="pa-sweep"
        />
      </g>
    </Stage>
  );
}

export default function ProcessArtboard({ step }: { step: number }) {
  // Before the first step opens, rest on the research stage.
  const s = step < 0 ? 0 : Math.min(step, 3);
  const ref = useRef<HTMLDivElement>(null);

  // The loops are SVG opacity and dash animations, which can't be handed to
  // the compositor: left running, they repaint every frame for the rest of
  // the visit. Pause them whenever the artboard is off screen.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      for (const a of el.getAnimations({ subtree: true })) {
        if (entry.isIntersecting) a.play();
        else a.pause();
      }
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="absolute inset-0 flex items-center justify-center p-8"
    >
      <svg
        viewBox="0 0 420 420"
        className="h-full w-full max-h-[460px] max-w-[460px]"
        fill="none"
        aria-hidden
      >
        {/* stages stack in place; only the open one is visible */}
        <g>
          <Understand on={s === 0} />
          <Define on={s === 1} />
          <Wireframe on={s === 2} />
          <Shipped on={s === 3} />
        </g>
      </svg>
    </div>
  );
}
