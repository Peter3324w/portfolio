"use client";

import { useEffect, useRef, useState } from "react";

interface BlurRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  ready?: boolean;
  duration?: number;
}

export default function BlurReveal({
  children,
  className = "",
  delay = 0,
  ready = true,
  duration = 0.8,
}: BlurRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [triggered, setTriggered] = useState(false);

  useEffect(() => {
    if (!ready || triggered) return;

    const el = ref.current;
    if (!el) return;

    // Trigger instantly if element is in viewport OR has already been scrolled
    // past. The second case matters when returning to a page with a restored
    // scroll position — we shouldn't re-animate content the user already saw.
    const rect = el.getBoundingClientRect();
    const inViewOrPast = rect.top < window.innerHeight;

    if (inViewOrPast) {
      // Needs the measured rect, so it can't be derived during render.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTriggered(true);
      return;
    }

    // For elements below the fold, use IntersectionObserver
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTriggered(true);
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [ready, triggered]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        filter: triggered ? "blur(0)" : "blur(12px)",
        opacity: triggered ? 1 : 0,
        transform: triggered ? "scale(1)" : "scale(1.06)",
        transition: `filter ${duration}s ease ${delay}s, opacity ${duration * 0.75}s ease ${delay}s, transform ${duration}s ease ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}
