"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  HANDOVER,
  clearHandoverArrival,
  setHandoverArrival,
  type HandoverDetail,
} from "../lib/handover";
import { getLenis } from "../lib/lenis";
import { pushProgress, type CameraPushDetail } from "../lib/cameraPush";
import {
  CASE_TITLE_CLASS,
  NEXT_PANEL_BG,
  NEXT_PANEL_INK,
  NEXT_TITLE_GREY,
  NextPanelDecor,
} from "./NextPanel";

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const fit = (v: number, a: number, b: number) => clamp((v - a) / (b - a));
const quintInOut = (t: number) =>
  t < 0.5 ? 16 * t ** 5 : 1 - (-2 * t + 2) ** 5 / 2;

export default function ProjectTransition() {
  const [mounted, setMounted] = useState(false);
  const [handover, setHandover] = useState<HandoverDetail | null>(null);
  const [push, setPush] = useState<CameraPushDetail | null>(null);
  const groundRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const paleRef = useRef<HTMLDivElement>(null);
  const decorRef = useRef<HTMLDivElement>(null);
  const greyRef = useRef<HTMLSpanElement>(null);
  const whiteRef = useRef<HTMLSpanElement>(null);
  const router = useRouter();
  // useRouter can return a new reference across navigations in Next 16 —
  // pin it so the effect below isn't re-triggered mid-transition.
  const routerRef = useRef(router);
  // eslint-disable-next-line react-hooks/refs -- only read inside event handlers
  routerRef.current = router;

  useEffect(() => {
    setMounted(true);
    const onHandover = (e: Event) => {
      const detail = (e as CustomEvent<HandoverDetail>).detail;
      if (detail) setHandover(detail);
    };
    const onPush = (e: Event) => {
      const detail = (e as CustomEvent<CameraPushDetail>).detail;
      if (detail) setPush(detail);
    };
    window.addEventListener("project:handover", onHandover);
    window.addEventListener("project:push", onPush);
    return () => {
      window.removeEventListener("project:handover", onHandover);
      window.removeEventListener("project:push", onPush);
    };
  }, []);

  // Home → case study. The home page runs the camera; this fades in the case
  // study's ground on the same clock (so the clicked image dissolves into
  // it), navigates once it's opaque, and lets the case study take over from
  // that frame.
  useEffect(() => {
    if (!push) return;
    const ground = groundRef.current;
    if (!ground) return;
    let raf = 0;
    let fallback = 0;
    let finished = false;

    const finish = (ready: boolean) => {
      if (finished) return;
      finished = true;
      window.removeEventListener("project:handoverReady", onReady);
      window.clearTimeout(fallback);
      if (!ready) {
        clearHandoverArrival();
        getLenis()?.start();
      }
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          ground.style.display = "none";
          window.dispatchEvent(new CustomEvent("project:handoverDone"));
          setPush(null);
        })
      );
    };
    const onReady = () => finish(true);

    const step = (now: number) => {
      const t = Math.min(1, Math.max(0, (now - push.startAt) / push.duration));
      ground.style.opacity = String(pushProgress(t, push.zoomAt) ** push.dissolve);
      if (t < 1) {
        raf = requestAnimationFrame(step);
        return;
      }
      setHandoverArrival({ kind: "camera" });
      window.addEventListener("project:handoverReady", onReady);
      fallback = window.setTimeout(() => finish(false), 4000);
      routerRef.current.push(push.href);
    };
    raf = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(fallback);
      window.removeEventListener("project:handoverReady", onReady);
    };
  }, [push]);

  // Case study → next case study. The layer starts dressed as the next
  // project's panel (its first frame is the panel itself), slides across to
  // cover the screen with its title running a little ahead, and turns from
  // the panel's paper into the next project's own background. Then the route
  // changes under it, and the incoming page starts in the layer's last frame.
  useEffect(() => {
    if (!handover) return;
    const layer = layerRef.current;
    const pale = paleRef.current;
    const decor = decorRef.current;
    const grey = greyRef.current;
    const white = whiteRef.current;
    if (!layer || !pale || !decor || !grey || !white) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const { panelLeft, titleFrom, titleTo } = handover;
    const ix0 = titleFrom.x - panelLeft - titleTo.x;
    const iy0 = titleFrom.y - titleTo.y;
    const duration = reduced ? 1 : HANDOVER.expand;
    const t0 = performance.now();
    let raf = 0;
    let fallback = 0;
    let finished = false;

    const finish = (ready: boolean) => {
      if (finished) return;
      finished = true;
      window.removeEventListener("project:handoverReady", onReady);
      window.clearTimeout(fallback);
      // The next page never reported in: don't leave the arrival pending or
      // the page unable to scroll.
      if (!ready) {
        clearHandoverArrival();
        getLenis()?.start();
      }
      // Two frames so the incoming page has painted its matching frame, then
      // the layer goes and the page takes over from exactly there.
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          layer.style.display = "none";
          window.dispatchEvent(new CustomEvent("project:handoverDone"));
          setHandover(null);
        })
      );
    };
    const onReady = () => finish(true);

    const step = (now: number) => {
      const t = clamp((now - t0) / duration);
      const e = quintInOut(t);
      layer.style.transform = `translate3d(${(panelLeft * (1 - e)).toFixed(2)}px, 0, 0)`;
      const et = quintInOut(clamp(t * (1 + HANDOVER.lead)));
      const title = `translate3d(${(titleTo.x + ix0 * (1 - et)).toFixed(2)}px, ${(titleTo.y + iy0 * (1 - et)).toFixed(2)}px, 0)`;
      grey.style.transform = white.style.transform = title;
      const m = fit(t, HANDOVER.morph, 1);
      pale.style.opacity = String(1 - m);
      grey.style.opacity = String(1 - m);
      white.style.opacity = String(m);
      decor.style.opacity = String(1 - fit(t, 0, 0.3));
      if (t < 1) {
        raf = requestAnimationFrame(step);
        return;
      }
      setHandoverArrival({ kind: "handover", titleX: titleTo.x, titleY: titleTo.y });
      window.addEventListener("project:handoverReady", onReady);
      fallback = window.setTimeout(() => finish(false), 4000);
      routerRef.current.push(handover.href);
    };
    raf = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(fallback);
      window.removeEventListener("project:handoverReady", onReady);
    };
  }, [handover]);

  if (!mounted) return null;

  if (push) {
    return createPortal(
      <div
        ref={groundRef}
        aria-hidden="true"
        className="fixed inset-0 z-40 pointer-events-none"
        style={{
          opacity: 0,
          willChange: "opacity",
          backgroundColor: push.bgColor,
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url('${push.bgImage}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />,
      document.body
    );
  }

  if (handover) {
    const { panelLeft, panelWidth, titleFrom, name, bgColor, bgImage } =
      handover;
    const titleStart = `translate3d(${(titleFrom.x - panelLeft).toFixed(2)}px, ${titleFrom.y.toFixed(2)}px, 0)`;
    return createPortal(
      <div
        ref={layerRef}
        aria-hidden="true"
        className="fixed inset-0 z-40 pointer-events-none"
        style={{
          transform: `translate3d(${panelLeft}px, 0, 0)`,
          willChange: "transform",
        }}
      >
        {/* The next project's own ground: the same colour and texture its
            page sits on, revealed as the paper fades. */}
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: bgColor,
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url('${bgImage}')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div
          ref={paleRef}
          className="absolute inset-0"
          style={{ backgroundColor: NEXT_PANEL_BG, willChange: "opacity" }}
        />
        <div
          ref={decorRef}
          className="absolute left-0 top-0 h-full"
          style={
            {
              width: panelWidth,
              color: NEXT_PANEL_INK,
              "--fill": 1,
            } as React.CSSProperties
          }
        >
          <NextPanelDecor showHint={false} />
        </div>
        <span
          ref={greyRef}
          className={`absolute left-0 top-0 ${CASE_TITLE_CLASS}`}
          style={{ color: NEXT_TITLE_GREY, transform: titleStart }}
        >
          {name}
        </span>
        <span
          ref={whiteRef}
          className={`absolute left-0 top-0 ${CASE_TITLE_CLASS}`}
          style={{
            color: handover.textColor,
            opacity: 0,
            transform: titleStart,
          }}
        >
          {name}
        </span>
      </div>,
      document.body
    );
  }

  return null;
}
