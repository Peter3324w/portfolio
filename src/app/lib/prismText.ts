// Prism on headings. Text stays real HTML: every display-size heading (h1-h3
// at 24px and up, or anything marked data-prism-text) is split into one
// span per letter, and letters near the pointer's trail get a red text-shadow
// ahead of the motion and a cyan one behind it, the fringes a channel split
// leaves. Opt a heading out with data-prism-text="off".
//
// The trail is the same as the images' (lib/prism.ts), kept on the CPU:
// capsules stamped from the pointer's last position to its new one in page
// coordinates, so they stay on the content and a still pointer over a
// scrolling page paints too. Radius, fades and the scroll weight come from
// CURSOR_FX. Text gets its own look (CURSOR_FX.text): the fringe sits a fixed
// couple of pixels off the letter and fades in and out with the trail, with
// no drag. Only text-shadow changes, so it repaints the touched letters and
// never re-lays out the page.
import { CURSOR_FX } from "./cursorFx";
import { joinPrismLoop, pointer, prismEnabled } from "./prism";

const F = CURSOR_FX.field;
const SPLIT = CURSOR_FX.text.split;
const SELECTOR = "h1, h2, h3, [data-prism-text]";
const MIN_FONT = 24;
// A stamp is gone once its long ink has faded below 1%.
const MAX_AGE = Math.log(0.01) / Math.log(F.trailFade);

type Stamp = {
  ax: number; ay: number; bx: number; by: number; r: number; vx: number; vy: number; age: number;
  // This frame's ink and motion left in the stamp.
  ink: number; motion: number;
};
type Glyph = { el: HTMLSpanElement; lit: boolean };
type Root = { el: HTMLElement; glyphs: Glyph[]; undo: () => void };

const clamp1 = (v: number) => Math.max(-1, Math.min(1, v));

function distToSegment(px: number, py: number, s: Stamp) {
  const bax = s.bx - s.ax, bay = s.by - s.ay;
  const len = bax * bax + bay * bay;
  const h = len > 1e-6 ? Math.max(0, Math.min(1, ((px - s.ax) * bax + (py - s.ay) * bay) / len)) : 0;
  return Math.hypot(px - s.ax - bax * h, py - s.ay - bay * h);
}

// Splits a heading's text into letter spans. Spaces stay plain text, so
// lines still break between words exactly as before.
function split(el: HTMLElement): Root | null {
  if (el.closest('[data-prism-text="off"]')) return null;
  const size = parseFloat(getComputedStyle(el).fontSize);
  if (!el.hasAttribute("data-prism-text") && size < MIN_FONT) return null;
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const texts: Text[] = [];
  while (walker.nextNode()) texts.push(walker.currentNode as Text);
  const glyphs: Glyph[] = [];
  const undos: (() => void)[] = [];
  for (const text of texts) {
    if (!text.data.trim()) continue;
    const frag = document.createDocumentFragment();
    for (const ch of Array.from(text.data)) {
      if (/\s/.test(ch)) {
        frag.append(ch);
        continue;
      }
      const span = document.createElement("span");
      span.textContent = ch;
      frag.append(span);
      glyphs.push({ el: span, lit: false });
    }
    const parts = Array.from(frag.childNodes);
    text.replaceWith(frag);
    undos.push(() => {
      if (!parts[0]?.parentNode) return;
      parts[0].parentNode.insertBefore(text, parts[0]);
      parts.forEach((n) => n.parentNode?.removeChild(n));
    });
  }
  if (!glyphs.length) return null;
  el.dataset.prismSplit = "";
  return {
    el,
    glyphs,
    undo: () => {
      undos.forEach((u) => u());
      delete el.dataset.prismSplit;
    },
  };
}

// The running copy's stop. In dev, a hot reload can leave the previous copy
// going: its headings stay split, so a new copy would skip them and the old
// settings would stay on screen. Each start stops the one before it.
type PrismTextWindow = Window & { __prismTextStop?: () => void };

/** Starts Prism on headings site-wide. Returns the cleanup. */
export function startPrismText(): () => void {
  if (!prismEnabled()) return () => {};
  const win = window as PrismTextWindow;
  win.__prismTextStop?.();
  const roots = new Map<HTMLElement, Root>();
  const stamps: Stamp[] = [];
  let prev: { x: number; y: number; sx: number; sy: number } | null = null;

  const scan = (node: ParentNode) => {
    const found: HTMLElement[] = [];
    if (node instanceof HTMLElement && node.matches(SELECTOR)) found.push(node);
    node.querySelectorAll<HTMLElement>(SELECTOR).forEach((el) => found.push(el));
    for (const el of found) {
      if (roots.has(el) || el.hasAttribute("data-prism-split")) continue;
      // A heading inside one that's already split is covered by it.
      if (el.parentElement?.closest("[data-prism-split]")) continue;
      const root = split(el);
      if (root) roots.set(el, root);
    }
  };
  scan(document.body);
  // New pages (client navigation) bring new headings.
  const mo = new MutationObserver((records) => {
    for (const r of records) r.addedNodes.forEach((n) => { if (n instanceof HTMLElement) scan(n); });
  });
  mo.observe(document.body, { childList: true, subtree: true });

  const clear = (g: Glyph) => {
    g.el.style.textShadow = "";
    g.lit = false;
  };

  const frame = (dt: number) => {
    const steps = dt * 60;
    const sx = window.scrollX, sy = window.scrollY;

    // Stamp the move since last frame, in page coordinates.
    if (pointer.inside && prev) {
      const dx = pointer.x - prev.x, dy = pointer.y - prev.y;
      const dsx = sx - prev.sx, dsy = sy - prev.sy;
      const travel = Math.hypot(dx + dsx * F.scrollWeight, dy + dsy * F.scrollWeight);
      const r = Math.min(1, travel / 100) * Math.max(40, window.innerWidth / 20) * F.radius;
      if (r > 0.5) {
        stamps.push({
          ax: prev.x + prev.sx, ay: prev.y + prev.sy, bx: pointer.x + sx, by: pointer.y + sy, r,
          // Relative motion over the content, saturating at 6px a frame the
          // way the GPU texture saturates.
          vx: clamp1((dx + dsx) / 6), vy: clamp1((dy + dsy) / 6), age: 0, ink: 1, motion: 1,
        });
      }
    }
    prev = pointer.inside ? { x: pointer.x, y: pointer.y, sx, sy } : null;
    for (let i = stamps.length - 1; i >= 0; i--) {
      const s = stamps[i];
      s.age += steps;
      if (s.age > MAX_AGE) {
        stamps.splice(i, 1);
        continue;
      }
      s.ink = 0.7 * Math.pow(F.trailFade, s.age) + 0.3 * Math.pow(F.coreFade, s.age);
      s.motion = Math.pow(F.velocityFade, s.age);
    }

    // Where the trail is on screen, padded by the largest split.
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const s of stamps) {
      x0 = Math.min(x0, s.ax - s.r, s.bx - s.r); x1 = Math.max(x1, s.ax + s.r, s.bx + s.r);
      y0 = Math.min(y0, s.ay - s.r, s.by - s.r); y1 = Math.max(y1, s.ay + s.r, s.by + s.r);
    }
    const pad = SPLIT;

    // Read every glyph position first, then write, so nothing forces layout.
    const writes: [Glyph, string][] = [];
    roots.forEach((root, el) => {
      if (!el.isConnected) {
        roots.delete(el);
        return;
      }
      const rr = el.getBoundingClientRect();
      const near = stamps.length > 0 &&
        rr.right + sx > x0 - pad && rr.left + sx < x1 + pad && rr.bottom + sy > y0 - pad && rr.top + sy < y1 + pad;
      for (const g of root.glyphs) {
        if (!near) {
          if (g.lit) writes.push([g, ""]);
          continue;
        }
        const b = g.el.getBoundingClientRect();
        const px = b.left + b.width / 2 + sx, py = b.top + b.height / 2 + sy;
        let w = 0, vx = 0, vy = 0;
        for (const s of stamps) {
          const d = distToSegment(px, py, s);
          if (d >= s.r) continue;
          const t = d / s.r;
          const k = 1 - t * t * (3 - 2 * t);
          w += k * s.ink;
          vx += s.vx * k * s.motion;
          vy += s.vy * k * s.motion;
        }
        w = Math.min(1, w);
        const ox = clamp1(vx) * w, oy = clamp1(vy) * w;
        const strength = Math.hypot(ox, oy);
        if (strength < 0.02) {
          if (g.lit) writes.push([g, ""]);
          continue;
        }
        // Direction from the motion, distance fixed; the trail's strength
        // shows as opacity instead.
        const ux = (ox / strength) * SPLIT, uy = (oy / strength) * SPLIT;
        const a = (0.85 * Math.min(1, strength * 2)).toFixed(2);
        writes.push([g,
          `${ux.toFixed(1)}px ${uy.toFixed(1)}px 0 rgba(255, 38, 70, ${a}), ` +
          `${(-ux).toFixed(1)}px ${(-uy).toFixed(1)}px 0 rgba(0, 214, 255, ${a})`]);
      }
    });
    for (const [g, shadow] of writes) {
      if (!shadow) clear(g);
      else {
        g.el.style.textShadow = shadow;
        g.lit = true;
      }
    }
  };

  const leave = joinPrismLoop({ frame });
  let stopped = false;
  const stop = () => {
    if (stopped) return;
    stopped = true;
    leave();
    mo.disconnect();
    roots.forEach((root) => {
      root.glyphs.forEach(clear);
      root.undo();
    });
    roots.clear();
    if (win.__prismTextStop === stop) delete win.__prismTextStop;
  };
  win.__prismTextStop = stop;
  return stop;
}
