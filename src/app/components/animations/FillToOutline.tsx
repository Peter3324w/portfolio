"use client";

import { useEffect, useRef } from "react";

interface FillToOutlineProps {
  children: string;
  className?: string;
  as?: "h1" | "h2" | "p" | "span";
  style?: React.CSSProperties;
}

export default function FillToOutline({
  children,
  className = "",
  as: Tag = "h1",
  style,
}: FillToOutlineProps) {
  const ref = useRef<HTMLElement>(null);
  const charsRef = useRef<HTMLSpanElement[]>([]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Skip the cursor fill-to-outline effect on smaller text — feels noisy at body/subhead sizes
    const fontSize = parseFloat(window.getComputedStyle(el).fontSize);
    if (fontSize < 50) return;

    const chars = charsRef.current;
    const radius = 60;

    const onMove = (e: MouseEvent) => {
      chars.forEach((ch) => {
        if (!ch) return;
        const rect = ch.getBoundingClientRect();
        const dist = Math.hypot(
          rect.left + rect.width / 2 - e.clientX,
          rect.top + rect.height / 2 - e.clientY
        );

        if (dist < radius) {
          ch.style.color = "transparent";
        } else {
          ch.style.color = "#111111";
        }
      });
    };

    const onLeave = () => {
      chars.forEach((ch) => {
        if (!ch) return;
        ch.style.color = "";
      });
    };

    window.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);

    return () => {
      window.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  // Split text by <br> markers and characters
  const lines = children.split("\n");
  let charIndex = 0;

  return (
    <Tag
      ref={ref as React.Ref<HTMLHeadingElement>}
      className={className}
      style={{ WebkitTextStroke: "2px #111111", ...style }}
    >
      {lines.map((line, li) => (
        <span key={li}>
          {li > 0 && <br />}
          {line.split("").map((ch) => {
            if (ch === " ") {
              charIndex++;
              return <span key={`s-${charIndex}`}>&nbsp;</span>;
            }
            const i = charIndex++;
            return (
              <span
                key={i}
                ref={(el) => {
                  if (el) charsRef.current[i] = el;
                }}
                style={{
                  display: "inline-block",
                  transition: "color 0.2s ease, opacity 0.2s ease",
                }}
              >
                {ch}
              </span>
            );
          })}
        </span>
      ))}
    </Tag>
  );
}
