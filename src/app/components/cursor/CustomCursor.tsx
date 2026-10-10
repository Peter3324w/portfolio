"use client";

import { useEffect, useRef, useState } from "react";

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const rotationRef = useRef(0);
  const modeRef = useRef<"default" | "case">("default");
  const [mode, setMode] = useState<"default" | "case">("default");
  const [light, setLight] = useState(false);
  const lightRef = useRef(false);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    let mx = 0, my = 0;
    let rafId: number;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
    };

    // Sits exactly on the pointer every frame. It used to ease 18% of the way
    // there per frame, which left it trailing behind fast moves.
    const tick = () => {
      rotationRef.current += 0.3;
      const rot = modeRef.current === "default" ? rotationRef.current : 0;
      cursor.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%) rotate(${rot}deg)`;
      rafId = requestAnimationFrame(tick);
    };

    let leaveTimeout: ReturnType<typeof setTimeout> | null = null;
    const evaluate = (el: Element | null) => {
      // Element-driven theming: the nearest [data-cursor-theme] ancestor wins.
      // Values: "light" → light cursor, "dark" → dark cursor. Falls back to
      // the legacy "below main bottom = footer = light" heuristic.
      const themed = el?.closest<HTMLElement>("[data-cursor-theme]") ?? null;
      let isLight: boolean;
      if (themed) {
        isLight = themed.dataset.cursorTheme === "light";
      } else {
        const main = document.querySelector("main");
        const mainBottom = main
          ? main.getBoundingClientRect().bottom
          : Infinity;
        isLight = my > mainBottom;
      }
      if (isLight !== lightRef.current) {
        lightRef.current = isLight;
        setLight(isLight);
      }
      const isCase = !!el?.closest('[data-cursor="case-study"]');
      if (isCase) {
        if (leaveTimeout) {
          clearTimeout(leaveTimeout);
          leaveTimeout = null;
        }
        if (modeRef.current !== "case") setMode("case");
      } else if (modeRef.current === "case" && !leaveTimeout) {
        leaveTimeout = setTimeout(() => {
          setMode("default");
          leaveTimeout = null;
        }, 120);
      }
    };
    const onOver = (e: MouseEvent) => {
      evaluate(e.target as Element | null);
    };
    const onScroll = () => {
      evaluate(document.elementFromPoint(mx, my));
    };

    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseover", onOver);
    window.addEventListener("scroll", onScroll, { passive: true });
    rafId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafId);
      if (leaveTimeout) clearTimeout(leaveTimeout);
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      className="fixed top-0 left-0 z-[100] pointer-events-none max-md:hidden"
      style={{ willChange: "transform" }}
    >
      {mode === "default" ? (
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <circle
            cx="20"
            cy="20"
            r="19"
            stroke={light ? "#f6f6f6" : "#111111"}
            strokeWidth="0.5"
            clipPath="url(#left-half)"
          />
          <circle
            cx="20"
            cy="20"
            r="19"
            stroke={light ? "rgba(246,246,246,0.25)" : "rgba(17,17,17,0.25)"}
            strokeWidth="0.5"
            clipPath="url(#right-half)"
          />
          <line x1="20" y1="0" x2="20" y2="40" stroke={light ? "#f6f6f6" : "#111111"} strokeWidth="1" />
          <line x1="0" y1="20" x2="40" y2="20" stroke={light ? "#f6f6f6" : "#111111"} strokeWidth="1" />
          <circle cx="20" cy="20" r="3" stroke={light ? "#f6f6f6" : "#111111"} strokeWidth="1" fill="none" />
          <defs>
            <clipPath id="left-half">
              <rect x="0" y="0" width="20" height="40" />
            </clipPath>
            <clipPath id="right-half">
              <rect x="20" y="0" width="20" height="40" />
            </clipPath>
          </defs>
        </svg>
      ) : (
        <div
          className={`rounded-full px-5 py-2.5 whitespace-nowrap ${
            light ? "bg-[#f6f6f6]" : "bg-[#111111]"
          }`}
        >
          <span
            className={`text-[12px] uppercase tracking-[0.12em] font-medium ${
              light ? "text-[#111111]" : "text-[#f6f6f6]"
            }`}
          >
            Case Study
          </span>
        </div>
      )}
    </div>
  );
}
