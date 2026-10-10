"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import TopoBackground from "../animations/TopoBackground";
import FillToOutline from "../animations/FillToOutline";
import BlurReveal from "../animations/BlurReveal";
import { usePrism } from "../animations/usePrism";

type Props = {
  loadingDone: boolean;
};

export default function HeroSection({ loadingDone }: Props) {
  const faceRef = useRef<HTMLDivElement>(null);
  usePrism(faceRef);

  useEffect(() => {
    let mx = 0, my = 0, sx = 0, sy = 0;
    let rx = 0, ry = 0, srx = 0, sry = 0;
    let rafId: number;
    const maxTilt = 18;

    const onMove = (e: MouseEvent) => {
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      mx = nx * 30;
      my = ny * 30;
      ry = nx * maxTilt;
      rx = -ny * maxTilt;
    };

    const tick = () => {
      sx += (mx - sx) * 0.04;
      sy += (my - sy) * 0.04;
      srx += (rx - srx) * 0.04;
      sry += (ry - sry) * 0.04;
      if (faceRef.current) {
        faceRef.current.style.transform = `perspective(800px) translate(${sx}px, ${sy}px) rotateX(${srx}deg) rotateY(${sry}deg)`;
      }
      rafId = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove);
    rafId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <section className="hero-section relative w-full h-screen max-h-[900px] overflow-hidden bg-[#f6f6f6]">
      <TopoBackground />

      <div className="relative w-full h-full max-w-[1296px] mx-auto">
        <div
          ref={faceRef}
          className="absolute inset-0 flex items-center justify-center z-[1] pointer-events-none"
        >
          <Image
            src="/images/chrome-face.png"
            alt=""
            width={520}
            height={850}
            className="mix-blend-multiply object-contain"
            priority
          />
        </div>

        {/* "FROM CONCEPT TO CRAFT" — top left (desktop) / bottom (mobile) */}
        <div className="absolute left-6 right-6 md:left-12 md:right-auto top-[calc(28%+112px)] z-[2] max-w-[560px] max-md:top-auto max-md:bottom-[56px]">
          <BlurReveal delay={0} duration={0.9} ready={loadingDone}>
            <FillToOutline className="text-h1 text-[#111111]">
              {"From concept\nto craft"}
            </FillToOutline>
          </BlurReveal>
          <BlurReveal delay={0.0375} duration={0.9} ready={loadingDone}>
            <p className="text-body text-[#111111]/70 mt-4 max-w-[340px]">
              Thoughtful design that solves real problems, beautifully —
              bridging the gap between what users need and what businesses
              want.
            </p>
          </BlurReveal>
        </div>

        {/* "RAW IDEAS REFINED RESULTS" — bottom right */}
        <div className="absolute right-12 bottom-[12%] z-[2] text-right max-md:hidden">
          <BlurReveal delay={0.025} duration={0.9} ready={loadingDone}>
            <FillToOutline className="text-h1 text-[#111111]">
              {"Raw ideas\nrefined results"}
            </FillToOutline>
          </BlurReveal>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[2] animate-bounce">
          <Image
            src="/images/icon-scroll-down.svg"
            alt="Scroll down"
            width={24}
            height={24}
            className="opacity-40"
          />
        </div>
      </div>
    </section>
  );
}
