"use client";

import { useEffect, type RefObject } from "react";

// The skills → contact fly-through. Every plane inside the stage that carries
// `data-fly` sits at a depth along one corridor; scrolling moves the camera
// down it. The skills grid is the nearest plane (its centre cell is a hole
// onto the corridor), the contact section is the farthest (the light at the
// end), and process gates and project screens hang in between.
//
// Only transform and opacity change per frame, nothing runs while the page is
// still, and planes are promoted to layers only while the camera moves — so
// a stopped frame re-rasters sharp instead of showing upscaled pixels.
//
// Tuned in the standalone demo (Downloads/portfolio-fly-through.html).
const FLY = {
  lens: 1000, // perspective, px: the eye's distance from the screen plane
  depth: 7000, // corridor length, px
  spread: 1, // how far off-axis the side panels hang
  dust: 180,
  streaks: 0.6,
  parallax: 24, // px the vanishing point follows the mouse
};

// Depths in markup (data-z) are authored for a 7000px corridor.
const AUTHORED_DEPTH = 7000;
// The camera travels between these points of the pinned stretch. It starts
// straight away (the magnetic pull already lands you on the grid at rest) and
// ends with a short rest on the contact section.
const TRAVEL_FROM = 0;
const TRAVEL_TO = 0.95;
// Planes fade in over this distance ahead of the camera.
const FOG_FAR = 3400;
// HomeShell decides the nav's treatment from what sits under this line.
const NAV_LINE = 36;
const DESKTOP = 768;

type Kind = "wall" | "gate" | "panel" | "end";
type Plane = {
  el: HTMLElement;
  kind: Kind;
  z: number;
  x: number;
  y: number;
  shown: boolean;
};

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};

// Offset of `el` inside `ancestor`, ignoring transforms.
function offsetTopWithin(el: HTMLElement, ancestor: HTMLElement) {
  let top = 0;
  let node: HTMLElement | null = el;
  while (node && node !== ancestor) {
    top += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return top;
}

export function useFlyThrough({
  section,
  stage,
  canvas,
  hole,
  holeFill,
}: {
  section: RefObject<HTMLElement | null>;
  stage: RefObject<HTMLElement | null>;
  canvas: RefObject<HTMLCanvasElement | null>;
  hole: RefObject<HTMLElement | null>;
  holeFill: RefObject<HTMLElement | null>;
}) {
  useEffect(() => {
    const sectionEl = section.current;
    const stageEl = stage.current;
    const canvasEl = canvas.current;
    const holeEl = hole.current;
    const fillEl = holeFill.current;
    const ctx = canvasEl?.getContext("2d");
    if (!sectionEl || !stageEl || !canvasEl || !holeEl || !fillEl || !ctx) {
      return;
    }

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const planes: Plane[] = Array.from(
      stageEl.querySelectorAll<HTMLElement>("[data-fly]")
    ).map((el) => ({
      el,
      kind: el.dataset.fly as Kind,
      z: Number(el.dataset.z ?? 0),
      x: Number(el.dataset.x ?? 0),
      y: Number(el.dataset.y ?? 0),
      shown: true,
    }));
    const wall = planes.find((p) => p.kind === "wall");
    if (!wall) return;

    // Dust: fixed points down the corridor, projected with the same lens as
    // the planes so the two travel together.
    let seed = 7;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const dust = Array.from({ length: FLY.dust }, () => ({
      x: (rnd() * 2 - 1) * 1.3,
      y: (rnd() * 2 - 1) * 1.3,
      z: -(250 + rnd() * (AUTHORED_DEPTH - 250)),
      r: 0.6 + rnd() * 0.9,
    }));

    let W = 0;
    let H = 0;
    let dpr = 1;
    let holeW = 1;
    let holeH = 1;
    let holeTop = 0;
    let desktop = false;

    const measure = () => {
      W = stageEl.clientWidth;
      H = stageEl.clientHeight;
      dpr = Math.min(2, window.devicePixelRatio || 1);
      canvasEl.width = Math.round(W * dpr);
      canvasEl.height = Math.round(H * dpr);
      holeW = holeEl.offsetWidth || 1;
      holeH = holeEl.offsetHeight || 1;
      holeTop = offsetTopWithin(holeEl, wall.el);
    };

    const progress = () => {
      const r = sectionEl.getBoundingClientRect();
      const total = sectionEl.offsetHeight - stageEl.offsetHeight;
      return total > 0 ? clamp(-r.top / total) : 0;
    };

    // Eased out only: the zoom answers the first scroll and the landing
    // settles. (An ease-in-out plus a rest at the start took most of a
    // screen of scrolling before the grid visibly moved.)
    const cameraAt = (p: number) => {
      const u = clamp((p - TRAVEL_FROM) / (TRAVEL_TO - TRAVEL_FROM));
      return FLY.depth * Math.sin((Math.PI / 2) * u);
    };

    let navDark = false;
    const setNavDark = (on: boolean) => {
      if (on === navDark) return;
      navDark = on;
      stageEl.dataset.navDark = on ? "on" : "off";
      // Light cursor over the corridor, dark over paper.
      stageEl.dataset.cursorTheme = on ? "light" : "dark";
      window.dispatchEvent(new Event("navdark"));
    };

    let ox = 0;
    let oy = 0;
    let lastT = 0;
    let currentT = 0;
    let lastP = -1;
    let lastLens = "";
    let lastOrigin = "";
    let moving = false;
    let idleTimer = 0;

    const setPromoted = (on: boolean) => {
      for (const plane of planes) {
        plane.el.style.willChange = on ? "transform, opacity" : "";
      }
    };

    const markMoving = () => {
      if (!moving) {
        moving = true;
        setPromoted(true);
      }
      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(() => {
        moving = false;
        setPromoted(false);
        lastT = currentT;
        // One still frame: streaks collapse to dots, planes re-raster sharp.
        render(false);
      }, 180);
    };

    // Back to the phone layout: hand every plane back to normal flow.
    const resetAll = () => {
      for (const plane of planes) {
        plane.el.style.transform = "";
        plane.el.style.opacity = "";
        plane.el.style.visibility = "";
        plane.el.style.willChange = "";
        plane.shown = true;
      }
      fillEl.style.opacity = "";
      holeEl.style.pointerEvents = "";
      stageEl.style.perspective = "";
      stageEl.style.perspectiveOrigin = "";
      lastLens = "";
      lastOrigin = "";
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
      setNavDark(false);
    };

    const drawDust = (T: number, prevT: number, cx: number, cy: number, p: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      // Nothing to see while the centre cell is still solid paper.
      if (p < 0.012) return;
      const P = FLY.lens;
      const k = FLY.streaks;
      ctx.lineCap = "round";
      for (const d of dust) {
        const z = (d.z * FLY.depth) / AUTHORED_DEPTH;
        const zr = z + T;
        if (zr > P * 0.9 || zr < -FOG_FAR * 1.3) continue;
        const s = P / (P - zr);
        const px = cx + d.x * (W / 2) * s;
        const py = cy + d.y * (H / 2) * s;
        if (px < -20 || px > W + 20 || py < -20 || py > H + 20) continue;
        const a =
          smooth(-FOG_FAR * 1.3, -FOG_FAR * 0.4, zr) *
          (1 - smooth(P * 0.6, P * 0.9, zr)) *
          0.7;
        const sp = P / (P - Math.min(z + prevT, P * 0.9));
        const qx = cx + d.x * (W / 2) * sp;
        const qy = cy + d.y * (H / 2) * sp;
        const w = clamp(d.r * s, 0.5, 2.4);
        ctx.globalAlpha = a;
        if (Math.hypot(px - qx, py - qy) * k > 1.2) {
          ctx.strokeStyle = "#f6f6f6";
          ctx.lineWidth = w;
          ctx.beginPath();
          ctx.moveTo(px + (qx - px) * k, py + (qy - py) * k);
          ctx.lineTo(px, py);
          ctx.stroke();
        } else {
          ctx.fillStyle = "#f6f6f6";
          ctx.beginPath();
          ctx.arc(px, py, w * 0.6, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    };

    const render = (fromScroll: boolean) => {
      if (window.innerWidth < DESKTOP) {
        if (desktop) resetAll();
        desktop = false;
        return;
      }
      if (!desktop) {
        desktop = true;
        measure();
      }

      const p = progress();
      const P = FLY.lens;
      const cx = W / 2 + ox;
      const cy = H / 2 + oy;
      const lens = `${P}px`;
      const origin = `${cx.toFixed(1)}px ${cy.toFixed(1)}px`;
      if (lens !== lastLens) stageEl.style.perspective = lastLens = lens;
      if (origin !== lastOrigin) {
        stageEl.style.perspectiveOrigin = lastOrigin = origin;
      }

      if (reduced) {
        // No travel: the grid holds, then the contact section fades in.
        const f = smooth(0.42, 0.58, p);
        for (const plane of planes) {
          const show =
            plane.kind === "wall" ? f < 1 : plane.kind === "end";
          plane.el.style.visibility = show ? "" : "hidden";
          plane.el.style.transform = "none";
          plane.el.style.opacity =
            plane.kind === "wall" ? String(1 - f) : String(f);
        }
        setNavDark(false);
        return;
      }

      const T = cameraAt(p);
      currentT = T;
      if (fromScroll && p !== lastP) markMoving();
      lastP = p;

      // The wall can go once its hole covers the whole screen.
      const holeScale = Math.max(W / holeW, H / holeH) * 1.06;
      const wallGone = P * (1 - 1 / holeScale);

      for (const plane of planes) {
        const z =
          plane.kind === "end"
            ? -FLY.depth
            : (plane.z * FLY.depth) / AUTHORED_DEPTH;
        const zr = z + T; // relative to the screen plane; the eye is at P
        let o = 1;
        let hide = false;
        if (plane.kind === "wall") {
          hide = zr >= wallGone;
        } else if (plane.kind === "gate") {
          o =
            smooth(-FOG_FAR, -FOG_FAR * 0.5, zr) *
            (1 - smooth(P * 0.02, P * 0.22, zr));
          hide = zr > P * 0.3 || o < 0.002;
        } else if (plane.kind === "panel") {
          o =
            smooth(-FOG_FAR, -FOG_FAR * 0.5, zr) *
            (1 - smooth(P * 0.5, P * 0.82, zr));
          hide = zr > P * 0.86 || o < 0.002;
        }
        if (hide === plane.shown) {
          plane.shown = !hide;
          plane.el.style.visibility = hide ? "hidden" : "";
        }
        if (hide) continue;
        const x = plane.x * W * FLY.spread;
        const y = plane.y * H;
        // At rest on the grid or the contact section, drop the transform so
        // the plane renders at native sharpness.
        plane.el.style.transform =
          Math.abs(zr) < 0.5 && x === 0 && y === 0
            ? "none"
            : `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, ${zr.toFixed(2)}px)`;
        plane.el.style.opacity = o.toFixed(3);
      }

      // The centre cell empties into a window onto the corridor.
      const fill = 1 - smooth(0.012, 0.075, p);
      fillEl.style.opacity = fill.toFixed(3);
      holeEl.style.pointerEvents = fill < 0.5 ? "none" : "";

      // Is the nav over the corridor? Through the open hole at first, then
      // anywhere above the contact panel's top edge until it arrives.
      const wallZr = T;
      if (wallZr < wallGone) {
        const s = P / (P - wallZr);
        setNavDark(fill < 0.5 && cy + (holeTop - cy) * s < NAV_LINE);
      } else {
        const s = P / (P - (T - FLY.depth));
        setNavDark(cy * (1 - s) > NAV_LINE);
      }

      drawDust(T, fromScroll ? lastT : T, cx, cy, p);
      lastT = T;
    };

    let queued = false;
    const onScroll = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        render(true);
      });
    };

    // The vanishing point follows the mouse, eased; the loop stops once
    // it settles.
    let tx = 0;
    let ty = 0;
    let parallaxRaf = 0;
    const stepParallax = () => {
      ox += (tx - ox) * 0.08;
      oy += (ty - oy) * 0.08;
      render(false);
      parallaxRaf =
        Math.abs(tx - ox) > 0.1 || Math.abs(ty - oy) > 0.1
          ? requestAnimationFrame(stepParallax)
          : 0;
    };
    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || !desktop) return;
      const r = stageEl.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 2 * FLY.parallax;
      ty = ((e.clientY - r.top) / r.height - 0.5) * 2 * FLY.parallax;
      if (!parallaxRaf) parallaxRaf = requestAnimationFrame(stepParallax);
    };
    const onPointerLeave = () => {
      tx = 0;
      ty = 0;
      if (!parallaxRaf) parallaxRaf = requestAnimationFrame(stepParallax);
    };

    const onResize = () => {
      if (window.innerWidth >= DESKTOP) measure();
      render(false);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    if (!reduced) {
      stageEl.addEventListener("pointermove", onPointerMove);
      stageEl.addEventListener("pointerleave", onPointerLeave);
    }
    render(false);
    let disposed = false;
    document.fonts?.ready.then(() => {
      if (disposed) return;
      if (desktop) measure();
      render(false);
    });

    return () => {
      disposed = true;
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      stageEl.removeEventListener("pointermove", onPointerMove);
      stageEl.removeEventListener("pointerleave", onPointerLeave);
      cancelAnimationFrame(parallaxRaf);
      window.clearTimeout(idleTimer);
      setNavDark(false);
    };
  }, [section, stage, canvas, hole, holeFill]);
}
