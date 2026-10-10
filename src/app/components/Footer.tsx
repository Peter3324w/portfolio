"use client";

import { useEffect, useRef, forwardRef } from "react";
import Link from "next/link";
import { FRAME, FRAME_GUTTER, LINE } from "./home/frame";

interface FooterProps {
  highlight?: number;
}

const Footer = forwardRef<HTMLElement, FooterProps>(function Footer({ highlight = 0 }, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const xRef = useRef<HTMLAnchorElement>(null);
  const liRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (highlight <= 0) return;
    const trigger = (el: HTMLElement | null, delay: number) => {
      if (!el) return;
      el.classList.remove("animate-social-pulse");
      // Force reflow so removing + re-adding restarts the animation on rapid re-clicks
      void el.offsetWidth;
      window.setTimeout(() => el.classList.add("animate-social-pulse"), delay);
    };
    trigger(xRef.current, 0);
    trigger(liRef.current, 350);
  }, [highlight]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0, h = 0, dpr = 1;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const lineCount = 14;
    let t = 0;
    let rafId = 0;
    // The footer is fixed behind the page, so it was redrawing 14 full-width
    // paths every frame for the whole visit. Only draw once the page has
    // scrolled far enough to actually uncover it.
    let running = false;

    const uncovered = () => {
      const main = document.querySelector("main");
      if (!main) return true;
      return main.getBoundingClientRect().bottom <= window.innerHeight + 40;
    };

    const tick = () => {
      t += 0.004;
      ctx.clearRect(0, 0, w, h);
      ctx.lineWidth = 1;

      for (let i = 0; i < lineCount; i++) {
        const yBase = (h / (lineCount - 1)) * i;
        const amp = 18 + i * 2;
        const freq = 0.006 + i * 0.0002;
        const phase = t + i * 0.45;

        ctx.beginPath();
        ctx.strokeStyle = `rgba(255,255,255,${0.05 + (i / lineCount) * 0.1})`;

        for (let x = 0; x <= w; x += 6) {
          const y =
            yBase +
            Math.sin(x * freq + phase) * amp +
            Math.sin(x * freq * 0.5 + phase * 1.3) * amp * 0.4;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      rafId = requestAnimationFrame(tick);
    };

    const start = () => {
      if (running) return;
      running = true;
      rafId = requestAnimationFrame(tick);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(rafId);
    };
    const check = () => (uncovered() ? start() : stop());

    check();
    window.addEventListener("scroll", check, { passive: true });

    return () => {
      stop();
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <footer
      ref={ref}
      className="fixed bottom-0 left-0 right-0 w-screen h-screen bg-black overflow-hidden z-[1]"
      style={{ transformOrigin: "center center" }}
    >
      {/* Rails continue from the black home sections above */}
      <div aria-hidden className={`pointer-events-none absolute inset-0 ${FRAME_GUTTER}`}>
        <div className={`${FRAME} h-full border-x ${LINE}`} />
      </div>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />
      <div className="relative z-10 w-full h-full flex flex-col justify-end px-6 md:px-12 pt-12 pb-7 max-w-[1296px] mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 items-center gap-4 gap-y-6 md:gap-y-4">
          <span className="text-[#f6f6f6] text-body uppercase tracking-wider md:whitespace-nowrap justify-self-start max-md:col-start-1 max-md:row-start-1">&ldquo;Less, but better.&rdquo;</span>
          <Link
            href="/privacy"
            className="text-[#f6f6f6]/50 hover:text-[#f6f6f6]/90 transition-colors duration-300 text-[14px] max-md:text-[10px] font-normal uppercase tracking-wider cursor-none md:justify-self-center max-md:absolute max-md:bottom-[2px] max-md:left-1/2 max-md:-translate-x-1/2"
          >
            Privacy
          </Link>
          <div className="flex items-center gap-4 relative z-10 justify-self-end max-md:row-start-1 max-md:col-start-2">
            <a
              ref={xRef}
              href="https://x.com/203Peter"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter"
              className="group p-[2px] rounded-full border border-transparent hover:bg-[#f6f6f6] hover:border-[#f6f6f6] transition-colors duration-300 cursor-none"
            >
              <svg width="36" height="36" viewBox="0 0 90 90" className="text-[#f6f6f6] group-hover:text-[#000000] transition-colors duration-300" fill="currentColor">
                <path d="M 17.884 19.496 L 38.925 47.63 L 17.751 70.504 h 4.765 l 18.538 -20.027 l 14.978 20.027 h 16.217 L 50.024 40.788 l 19.708 -21.291 h -4.765 L 47.895 37.94 L 34.101 19.496 H 17.884 z M 24.892 23.006 h 7.45 L 65.24 66.993 h -7.45 L 24.892 23.006 z" />
                <path d="M 45 90 C 20.187 90 0 69.813 0 45 C 0 20.187 20.187 0 45 0 c 24.813 0 45 20.187 45 45 C 90 69.813 69.813 90 45 90 z M 45 3 C 21.841 3 3 21.841 3 45 c 0 23.159 18.841 42 42 42 c 23.159 0 42 -18.841 42 -42 C 87 21.841 68.159 3 45 3 z" />
              </svg>
            </a>
            <a
              ref={liRef}
              href="https://www.linkedin.com/in/peter-phiri-3324w"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="group p-[2px] rounded-full border border-transparent hover:bg-[#f6f6f6] hover:border-[#f6f6f6] transition-colors duration-300 cursor-none"
            >
              <svg width="36" height="36" viewBox="0 0 90 90" className="text-[#f6f6f6] group-hover:text-[#000000] transition-colors duration-300" fill="currentColor">
                <g opacity="0.9">
                  <rect x="23.24" y="37.45" width="9.33" height="30" />
                  <path d="M 27.904 33.356 c -2.988 0 -5.404 -2.423 -5.404 -5.406 c 0 -2.986 2.417 -5.41 5.405 -5.41 c 2.982 0 5.405 2.423 5.405 5.41 C 33.309 30.933 30.885 33.356 27.904 33.356 z" />
                  <path d="M 67.5 67.46 h -9.321 V 52.869 c 0 -3.48 -0.06 -7.956 -4.847 -7.956 c -4.853 0 -5.594 3.793 -5.594 7.706 V 67.46 h -9.321 V 37.455 h 8.945 v 4.103 h 0.127 c 1.245 -2.36 4.288 -4.847 8.824 -4.847 c 9.444 0 11.187 6.213 11.187 14.292 V 67.46 z" />
                </g>
                <path d="M 45 90 C 20.187 90 0 69.813 0 45 C 0 20.187 20.187 0 45 0 c 24.813 0 45 20.187 45 45 C 90 69.813 69.813 90 45 90 z M 45 3 C 21.841 3 3 21.841 3 45 c 0 23.159 18.841 42 42 42 c 23.159 0 42 -18.841 42 -42 C 87 21.841 68.159 3 45 3 z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
});

export default Footer;
