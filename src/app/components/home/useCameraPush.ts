"use client";

import { useCallback, useLayoutEffect, useRef } from "react";
import {
  CAMERA_PUSH,
  clearPendingReturn,
  fit01,
  lastPushFrom,
  peekPendingReturn,
  pushProgress,
  rememberPush,
  type CameraPushDetail,
} from "../../lib/cameraPush";
import { CASE_STUDY_BG_FALLBACK } from "../../lib/handover";
import { getLenis } from "../../lib/lenis";

// The home page's side of the camera push (see lib/cameraPush.ts), plus each
// card's inner life, after lusion.co: on hover the image hunts for focus (a
// quick shake and two small jolts), its focus point follows the pointer on a
// spring, and on click it springs back with an overshoot while the content
// rushes ahead of its frame.
//
// Cards opt in with [data-push-shot="<slug>"], holding a [data-push-lens]
// (the image layer that moves) and an optional [data-push-soft] (a tiny copy
// of the image the push dissolves into). Text that should clear out before
// the zoom carries [data-push-fade].
//
// Coming back from a case study, the page opens already pushed into that
// card under the case study's ground and pulls the camera back out: the same
// move, run backwards. The section always renders the ground, hidden; the
// pull-out shows it before the first paint. Whether we're returning is read
// here, in the layout effect, not at render: the case study marks it as it
// unmounts, which (on the browser's Back) is after this page has rendered.

// The lens sits a little larger than its frame so it can move without ever
// showing an edge.
const LENS_REST = 1.06;

// lusion's SecondOrderDynamics: a spring with a frequency (f), damping (z)
// and response (r > 1 overshoots at the start).
class Spring {
  private k1 = 0;
  private k2 = 0;
  private k3 = 0;
  private xp: number;
  private yd = 0;
  y: number;
  constructor(v: number, f: number, z: number, r: number) {
    this.set(f, z, r);
    this.xp = v;
    this.y = v;
  }
  set(f: number, z: number, r: number) {
    const w = 2 * Math.PI * f;
    this.k1 = z / (Math.PI * f);
    this.k2 = 1 / (w * w);
    this.k3 = (r * z) / w;
  }
  update(T: number, x: number) {
    const xd = (x - this.xp) / T;
    this.xp = x;
    const k2 = Math.max(this.k2, (T * T) / 2 + (T * this.k1) / 2, T * this.k1);
    this.y += T * this.yd;
    this.yd += (T * (x + this.k3 * xd - this.y - this.k1 * this.yd)) / k2;
    return this.y;
  }
}

// Smooth value noise with three octaves, for the handheld wobble.
const hash = (n: number) => {
  const x = Math.sin(n * 127.1) * 43758.5453;
  return x - Math.floor(x);
};
const noise1 = (x: number) => {
  const i = Math.floor(x);
  const f = x - i;
  const u = f * f * (3 - 2 * f);
  return (hash(i) * (1 - u) + hash(i + 1) * u) * 2 - 1;
};
const fbm = (x: number) =>
  noise1(x) * 0.57 + noise1(x * 2.03 + 17) * 0.29 + noise1(x * 4.01 + 41) * 0.14;

// Hover-time thresholds where the image jolts, as lusion has them.
const THRESHOLDS = [0, 0.2, 0.3];
const band = (v: number) => {
  const i = THRESHOLDS.findIndex((t) => v < t);
  return i === -1 ? THRESHOLDS.length : i;
};

// Returns the ref for the section the camera moves (the "scene"), the ref for
// the ground the pull-out starts under, and the push itself.
export function useCameraPush() {
  const sceneRef = useRef<HTMLElement>(null);
  const pushRef = useRef<(slug: string, bgColor: string) => void>(() => {});
  const groundRef = useRef<HTMLDivElement>(null);

  // A layout effect: the pull-out has to set its first (fully pushed-in)
  // frame before the page paints.
  useLayoutEffect(() => {
    const sceneEl = sceneRef.current;
    if (!sceneEl) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const C = CAMERA_PUSH;

    let busy = false;
    let pushU = 0;
    let pushRaf = 0;

    // ── Inner life of the one card being hovered or pushed ──
    const live = {
      shot: null as HTMLElement | null,
      lens: null as HTMLElement | null,
      hovering: false,
      ratio: 0,
      mx: 0,
      my: 0,
      shift: { x: 0, y: 0 },
      shiftT: { x: 0, y: 0 },
      fx: new Spring(0, 1, C.wobble, 2),
      fy: new Spring(0, 1, C.wobble, 2),
      zoom: new Spring(0, 2.2, 0.7, 3),
      raf: 0,
      last: 0,
    };

    const setLive = (shot: HTMLElement) => {
      if (live.shot === shot) return;
      if (live.lens) live.lens.style.transform = `scale(${LENS_REST})`;
      live.shot = shot;
      live.lens = shot.querySelector<HTMLElement>("[data-push-lens]");
      live.ratio = 0;
      live.fx = new Spring(0, 1, C.wobble, 2);
      live.fy = new Spring(0, 1, C.wobble, 2);
      live.zoom = new Spring(0, 2.2, 0.7, 3);
    };

    const liveStep = (now: number) => {
      live.raf = 0;
      const lens = live.lens;
      if (!live.shot || !lens) return;
      const dt = Math.min(0.05, (now - (live.last || now)) / 1000) || 1 / 60;
      live.last = now;

      const before = live.ratio;
      live.ratio = Math.min(
        1,
        Math.max(0, live.ratio + (live.hovering ? dt : -dt))
      );
      // A jolt in a random direction each time the hover crosses a threshold.
      if (live.hovering && band(before) !== band(live.ratio) && !reduced) {
        const a = Math.random() * Math.PI * 2;
        const m =
          Math.max(0, 1 - live.ratio / 0.6) *
          (band(live.ratio) === THRESHOLDS.length ? 0.5 : 1);
        live.shiftT = { x: Math.cos(a) * m, y: Math.sin(a) * m };
      } else {
        live.shiftT.x *= 0.95;
        live.shiftT.y *= 0.95;
      }
      live.shift.x += (live.shiftT.x - live.shift.x) * 0.2;
      live.shift.y += (live.shiftT.y - live.shift.y) * 0.2;

      let tx = 0;
      let ty = 0;
      if (pushU <= 0 && live.hovering) {
        // Follow the pointer a touch, with a fast shake that dies out over the
        // first 0.3s of the hover.
        const R = Math.max(0, 1 - live.ratio / 0.3) * 7 * (reduced ? 0 : C.jitter);
        const t = now / 1000;
        tx = -live.mx * live.shot.clientWidth * 0.04 + Math.cos(t * 20) * R;
        ty = -live.my * live.shot.clientHeight * 0.04 - Math.sin(t * 30) * R;
      }
      const fx = live.fx.update(dt, tx);
      const fy = live.fy.update(dt, ty);
      const zTarget = live.hovering || pushU > 0 ? 1 : 0;
      const z = live.zoom.update(dt, zTarget);
      const k = C.jitter * 9;
      const scale =
        LENS_REST + 0.03 * z + (reduced ? 0 : C.depth) * pushU * pushU;
      lens.style.transform = `translate(${(fx + live.shift.x * k).toFixed(2)}px, ${(fy + live.shift.y * k).toFixed(2)}px) scale(${scale.toFixed(4)})`;

      // Stop once everything rests; the push wakes the loop while it runs.
      const settled =
        !live.hovering &&
        Math.abs(fx - tx) < 0.05 &&
        Math.abs(fy - ty) < 0.05 &&
        Math.abs(z - zTarget) < 0.002 &&
        (pushU > 0 || live.ratio === 0);
      if (!settled) live.raf = requestAnimationFrame(liveStep);
      else {
        if (pushU <= 0) lens.style.transform = `scale(${LENS_REST})`;
        live.last = 0;
      }
    };
    const wake = () => {
      if (!live.raf) live.raf = requestAnimationFrame(liveStep);
    };

    const shots = Array.from(
      sceneEl.querySelectorAll<HTMLElement>("[data-push-shot]")
    );
    const listeners = shots.map((shot) => {
      const enter = (e: PointerEvent) => {
        if (busy || e.pointerType !== "mouse") return;
        setLive(shot);
        live.hovering = true;
        wake();
      };
      const move = (e: PointerEvent) => {
        const r = shot.getBoundingClientRect();
        live.mx = (e.clientX - r.left) / r.width - 0.5;
        live.my = (e.clientY - r.top) / r.height - 0.5;
      };
      const leave = () => {
        if (live.shot !== shot) return;
        live.hovering = false;
        wake();
      };
      shot.addEventListener("pointerenter", enter);
      shot.addEventListener("pointermove", move);
      shot.addEventListener("pointerleave", leave);
      return () => {
        shot.removeEventListener("pointerenter", enter);
        shot.removeEventListener("pointermove", move);
        shot.removeEventListener("pointerleave", leave);
      };
    });

    // ── The camera move, shared by the push and the pull-out ──
    type Geo = {
      vw: number;
      p: number;
      q: number;
      scaleEnd: number;
      fades: HTMLElement[];
      soft: HTMLElement | null;
    };
    const measure = (shot: HTMLElement): Geo => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      // Measure the untransformed layout (in development React runs the
      // effect twice, and the first run has already pushed in).
      sceneEl.style.transform = "";
      const s = sceneEl.getBoundingClientRect();
      const c = shot.getBoundingClientRect();
      // Scale around the middle of the screen, and paint above the sections
      // that follow, which would otherwise cover the growing card.
      sceneEl.style.transformOrigin = `${vw / 2 - s.left}px ${vh / 2 - s.top}px`;
      sceneEl.style.zIndex = "20";
      sceneEl.style.willChange = "transform";
      return {
        vw,
        p: vw / 2 - (c.left + c.width / 2),
        q: vh / 2 - (c.top + c.height / 2),
        scaleEnd: Math.max(vw / c.width, vh / c.height) * C.overshoot,
        fades: Array.from(
          document.querySelectorAll<HTMLElement>("[data-push-fade]")
        ),
        soft: shot.querySelector<HTMLElement>("[data-push-soft]"),
      };
    };
    // One frame of the move, t = 0 (the grid) … 1 (inside the card).
    const applyFrame = (t: number, g: Geo, now: number) => {
      const u = pushProgress(t, C.zoomAt);
      const l = 1 + (g.scaleEnd - 1) * u;
      // lusion's pivot shift: the card's centre travels straight to the
      // middle of the screen while everything scales around it.
      const k = 1 - (1 - u) / l;
      const turn = (u * C.tilt * g.p) / g.vw;
      pushU = u;
      wake();
      // Handheld: smooth noise on position and roll, strongest mid-push.
      const env = reduced ? 0 : Math.sin(Math.PI * u) * C.shake;
      const tn = now / 1000;
      const sx = fbm(tn * 1.8) * 9 * env;
      const sy = fbm(tn * 1.8 + 50) * 9 * env;
      const sr = fbm(tn * 1.3 + 100) * 0.7 * env;
      sceneEl.style.transform = `translate(${sx.toFixed(2)}px, ${sy.toFixed(2)}px) rotate(${sr.toFixed(3)}deg) perspective(${C.lens}px) rotateY(${turn}rad) rotateZ(${turn}rad) scale(${l}) translate(${(g.p * k).toFixed(2)}px, ${(g.q * k).toFixed(2)}px)`;
      const ui = String(1 - fit01(t, 0, C.zoomAt));
      for (const el of g.fades) el.style.opacity = ui;
      if (g.soft) g.soft.style.opacity = String(fit01(u, 0.45, 0.85));
    };
    const resetScene = () => {
      pushU = 0;
      sceneEl.style.transform = "";
      sceneEl.style.zIndex = "";
      sceneEl.style.willChange = "";
      document
        .querySelectorAll<HTMLElement>("[data-push-fade]")
        .forEach((el) => (el.style.opacity = ""));
      sceneEl
        .querySelectorAll<HTMLElement>("[data-push-soft]")
        .forEach((el) => (el.style.opacity = ""));
      wake();
    };

    // ── The push ──
    pushRef.current = (slug: string, bgColor: string) => {
      if (busy) return;
      const shot = sceneEl.querySelector<HTMLElement>(
        `[data-push-shot="${slug}"]`
      );
      if (!shot) return;
      busy = true;
      getLenis()?.stop();
      setLive(shot);
      live.hovering = false;
      rememberPush(slug, window.scrollY);
      const g = measure(shot);

      const detail: CameraPushDetail = {
        href: `/projects/${slug}`,
        startAt: performance.now(),
        duration: reduced ? 1 : C.duration,
        zoomAt: C.zoomAt,
        dissolve: C.dissolve,
        bgColor,
        bgImage: CASE_STUDY_BG_FALLBACK,
      };
      window.dispatchEvent(new CustomEvent("project:push", { detail }));

      const step = (now: number) => {
        const t = Math.min(1, Math.max(0, (now - detail.startAt) / detail.duration));
        applyFrame(t, g, now);
        if (t < 1) pushRaf = requestAnimationFrame(step);
      };
      pushRaf = requestAnimationFrame(step);
    };

    // ── The pull-out, when arriving back from a case study ──
    const ground = groundRef.current;
    const returning = peekPendingReturn()?.slug ?? null;
    const returnShot = returning
      ? sceneEl.querySelector<HTMLElement>(`[data-push-shot="${returning}"]`)
      : null;
    if (returning && (!returnShot || !ground)) {
      clearPendingReturn();
    } else if (returning && returnShot && ground) {
      // The case study's own ground, from the very first paint.
      ground.style.backgroundColor = returnShot.dataset.pushBg ?? "#0a0a0a";
      ground.style.display = "block";
      busy = true;
      const lenis = getLenis();
      lenis?.stop();
      // Nav's "Projects" item may have asked the home page to scroll; the
      // pull-out decides where the page sits.
      try {
        sessionStorage.removeItem("pendingScroll");
      } catch {
        /* storage blocked */
      }
      // Land on the framing the push left from, or with the card a quarter
      // of the way down the screen (lusion's rule) if we never pushed.
      const from = lastPushFrom();
      const y =
        from && from.slug === returning
          ? from.scrollY
          : Math.max(
              0,
              window.scrollY +
                returnShot.getBoundingClientRect().top -
                window.innerHeight * 0.25
            );
      window.scrollTo(0, y);
      lenis?.scrollTo(y, { immediate: true, force: true });
      setLive(returnShot);
      const g = measure(returnShot);
      applyFrame(1, g, performance.now());
      ground.style.opacity = "1";

      const startAt = performance.now();
      const duration = reduced ? 1 : C.duration;
      const step = (now: number) => {
        // Hold the framing against any late scroll restoration.
        if (Math.abs(window.scrollY - y) > 1) window.scrollTo(0, y);
        const t = 1 - Math.min(1, Math.max(0, (now - startAt) / duration));
        applyFrame(t, g, now);
        ground.style.opacity = String(pushProgress(t, C.zoomAt) ** C.dissolve);
        if (t > 0) {
          pushRaf = requestAnimationFrame(step);
          return;
        }
        resetScene();
        ground.style.display = "none";
        clearPendingReturn();
        busy = false;
        lenis?.start();
      };
      pushRaf = requestAnimationFrame(step);
    }

    // If the navigation never happened (this page is still here when the
    // hand-over finishes), put everything back.
    const onDone = () => {
      if (!busy) return;
      busy = false;
      resetScene();
    };
    window.addEventListener("project:handoverDone", onDone);

    return () => {
      listeners.forEach((off) => off());
      cancelAnimationFrame(pushRaf);
      cancelAnimationFrame(live.raf);
      window.removeEventListener("project:handoverDone", onDone);
      // Leave the section as it was found (unmounting, or React's second
      // development run).
      if (busy) resetScene();
    };
  }, []);

  const push = useCallback(
    (slug: string, bgColor: string) => pushRef.current(slug, bgColor),
    []
  );
  return { sceneRef, push, groundRef };
}
