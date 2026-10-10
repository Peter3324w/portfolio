"use client";

import { useEffect, useRef } from "react";

interface ProjectCardProps {
  children: React.ReactNode;
  className?: string;
  side?: "left" | "right";
  radius?: string;
  // Draws a hairline edge over the card (fades out toward the bottom).
  edge?: boolean;
  // Where the scroll zoom grows from.
  origin?: string;
}

export default function ProjectCard({ children, className = "", side = "left", radius = "24px", edge = false, origin = "center" }: ProjectCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    const img = imgRef.current;
    if (!card || !img) return;

    const maxTiltX = 8;
    const maxTiltY = 3;
    const minScale = 0.92;

    const onScroll = () => {
      const rect = card.getBoundingClientRect();
      const windowH = window.innerHeight;

      // Below viewport — set initial state
      if (rect.top > windowH) {
        const yTilt = side === "left" ? maxTiltY : -maxTiltY;
        card.style.transform = `perspective(800px) rotateX(${maxTiltX}deg) rotateY(${yTilt}deg) scale(${minScale})`;
        card.style.clipPath = `inset(30% 0 30% 0 round ${radius})`;
        img.style.transform = "scale(1.3)";
        return;
      }

      // Above viewport — stay drawn
      if (rect.bottom < 0) return;

      // Card entry animation — 250px trigger zone as card comes into view
      const enterDistance = windowH - rect.top;
      const triggerZone = 250;
      const progress = Math.min(1, Math.max(0, enterDistance / triggerZone));

      const tiltX = maxTiltX * (1 - progress);
      const tiltY = (side === "left" ? maxTiltY : -maxTiltY) * (1 - progress);
      const cardScale = minScale + (1 - minScale) * progress;
      const clip = 30 * (1 - progress);

      card.style.transform = `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(${cardScale})`;
      card.style.clipPath = `inset(${clip}% 0 ${clip}% 0 round ${radius})`;

      // Image zoom-out: continuous across the card's travel through the viewport.
      // 0 when card top is at bottom of viewport, 1 when card bottom is at top.
      const travel = windowH + rect.height;
      const viewportProgress = Math.min(1, Math.max(0, (windowH - rect.top) / travel));
      const imgScale = 1.4 - viewportProgress * 0.4;
      img.style.transform = `scale(${imgScale})`;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // ─── Cursor-follow tilt on the image (mirrors the hero face effect) ───
    const tilt = tiltRef.current;
    let tx = 0, ty = 0, rx = 0, ry = 0;
    let stx = 0, sty = 0, srx = 0, sry = 0;
    let active = false;
    const maxTilt = 10;
    const maxTrans = 12;

    const onMove = (e: MouseEvent) => {
      if (!tilt) return;
      const r = card.getBoundingClientRect();
      if (
        e.clientX < r.left || e.clientX > r.right ||
        e.clientY < r.top || e.clientY > r.bottom
      ) {
        active = false;
        tx = 0; ty = 0; rx = 0; ry = 0;
        return;
      }
      active = true;
      const nx = (e.clientX - r.left) / r.width - 0.5;
      const ny = (e.clientY - r.top) / r.height - 0.5;
      tx = nx * maxTrans;
      ty = ny * maxTrans;
      ry = nx * maxTilt;
      rx = -ny * maxTilt;
    };

    // The smoothing loop used to run for the life of the page, on every card.
    // Now it only runs while the pointer is on this card, plus the few frames
    // it takes to settle back to rest afterwards.
    let rafId = 0;
    let looping = false;
    const atRest = () =>
      Math.abs(stx - tx) < 0.01 &&
      Math.abs(sty - ty) < 0.01 &&
      Math.abs(srx - rx) < 0.01 &&
      Math.abs(sry - ry) < 0.01;

    const tick = () => {
      stx += (tx - stx) * 0.08;
      sty += (ty - sty) * 0.08;
      srx += (rx - srx) * 0.08;
      sry += (ry - sry) * 0.08;
      if (tilt) {
        tilt.style.transform = `perspective(800px) translate(${stx}px, ${sty}px) rotateX(${srx}deg) rotateY(${sry}deg)`;
      }
      if (!active && atRest()) {
        looping = false;
        return;
      }
      rafId = requestAnimationFrame(tick);
    };
    const startLoop = () => {
      if (looping) return;
      looping = true;
      rafId = requestAnimationFrame(tick);
    };
    const onCardMove = (e: MouseEvent) => {
      onMove(e);
      startLoop();
    };
    card.addEventListener("mousemove", onCardMove);
    card.addEventListener("mouseleave", () => {
      active = false;
      tx = 0; ty = 0; rx = 0; ry = 0;
      startLoop();
    });

    return () => {
      window.removeEventListener("scroll", onScroll);
      card.removeEventListener("mousemove", onCardMove);
      cancelAnimationFrame(rafId);
    };
  }, [side, radius]);

  return (
    <div
      ref={cardRef}
      className={`relative ${className}`}
      style={{
        transformOrigin: "center bottom",
        transition: "clip-path 0.4s cubic-bezier(0.23, 1, 0.32, 1), transform 0.4s cubic-bezier(0.23, 1, 0.32, 1)",
        willChange: "clip-path, transform",
      }}
    >
      <div
        ref={imgRef}
        className="overflow-hidden"
        style={{
          borderRadius: radius,
          transformOrigin: origin,
          transition: "transform 0.9s cubic-bezier(0.23, 1, 0.32, 1)",
          willChange: "transform",
        }}
      >
        <div ref={tiltRef} style={{ willChange: "transform" }}>
          {children}
        </div>
      </div>
      {edge && (
        <span aria-hidden className="shot-edge" style={{ borderRadius: radius }} />
      )}
    </div>
  );
}
