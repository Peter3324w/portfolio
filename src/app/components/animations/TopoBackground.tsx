"use client";

import { useEffect, useRef } from "react";

// ============================================
// Config
// ============================================
const CFG = {
  step: 14,
  scale: 0.004,
  speed: 0.02,
  levels: 12,
  octaves: 3,
  lineRGB: "180,180,180",
  padding: 80,
  shapeSize: 180,
};

// ============================================
// Perlin noise engine
// ============================================
const P = new Uint8Array(512);
(() => {
  const p = Array.from({ length: 256 }, (_, i) => i);
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [p[i], p[j]] = [p[j], p[i]];
  }
  for (let i = 0; i < 512; i++) P[i] = p[i & 255];
})();

function fade(t: number) {
  return t * t * t * (t * (t * 6 - 15) + 10);
}
function lerp(t: number, a: number, b: number) {
  return a + t * (b - a);
}
function grad(h: number, x: number, y: number, z: number) {
  h &= 15;
  const u = h < 8 ? x : y;
  const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
  return (h & 1 ? -u : u) + (h & 2 ? -v : v);
}

function noise(x: number, y: number, z: number) {
  const fl = Math.floor;
  const X = fl(x) & 255,
    Y = fl(y) & 255,
    Z = fl(z) & 255;
  x -= fl(x);
  y -= fl(y);
  z -= fl(z);
  const u = fade(x),
    v = fade(y),
    w = fade(z);
  const A = P[X] + Y,
    AA = P[A] + Z,
    AB = P[A + 1] + Z;
  const B = P[X + 1] + Y,
    BA = P[B] + Z,
    BB = P[B + 1] + Z;
  return lerp(
    w,
    lerp(
      v,
      lerp(u, grad(P[AA], x, y, z), grad(P[BA], x - 1, y, z)),
      lerp(u, grad(P[AB], x, y - 1, z), grad(P[BB], x - 1, y - 1, z))
    ),
    lerp(
      v,
      lerp(u, grad(P[AA + 1], x, y, z - 1), grad(P[BA + 1], x - 1, y, z - 1)),
      lerp(
        u,
        grad(P[AB + 1], x, y - 1, z - 1),
        grad(P[BB + 1], x - 1, y - 1, z - 1)
      )
    )
  );
}

function fbm(x: number, y: number, z: number) {
  let val = 0,
    amp = 1,
    freq = 1,
    max = 0;
  for (let i = 0; i < CFG.octaves; i++) {
    val += amp * noise(x * freq, y * freq, z * freq);
    max += amp;
    amp *= 0.5;
    freq *= 2;
  }
  return val / max;
}

// ============================================
// Marching squares lookup
// ============================================
const SEG: number[][][] = [
  [],
  [[0, 3]],
  [[0, 1]],
  [[1, 3]],
  [[1, 2]],
  [[0, 3], [1, 2]],
  [[0, 2]],
  [[2, 3]],
  [[2, 3]],
  [[0, 2]],
  [[0, 1], [2, 3]],
  [[1, 2]],
  [[1, 3]],
  [[0, 1]],
  [[0, 3]],
  [],
];

function ePt(
  e: number,
  cx: number,
  cy: number,
  v: number[],
  th: number
): [number, number] {
  let t: number;
  switch (e) {
    case 0:
      t = (th - v[0]) / (v[1] - v[0]);
      return [cx + t * CFG.step, cy];
    case 1:
      t = (th - v[1]) / (v[2] - v[1]);
      return [cx + CFG.step, cy + t * CFG.step];
    case 2:
      t = (th - v[3]) / (v[2] - v[3]);
      return [cx + t * CFG.step, cy + CFG.step];
    case 3:
      t = (th - v[0]) / (v[3] - v[0]);
      return [cx, cy + t * CFG.step];
    default:
      return [0, 0];
  }
}

const TH = Array.from(
  { length: CFG.levels },
  (_, i) => -0.4 + (i / (CFG.levels - 1)) * 0.8
);

// ============================================
// Shape SDFs
// ============================================
function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

const shapeSDF: Record<string, (dx: number, dy: number) => number> = {
  square: (dx, dy) => Math.max(Math.abs(dx), Math.abs(dy)),

  circle: (dx, dy) => Math.sqrt(dx * dx + dy * dy),

  triangle: (dx, dy) => {
    const sc = 0.85;
    const sx = dx / sc,
      sy = dy / sc;
    const S3H = 0.8660254;
    const IR = 0.5773503;
    const d1 = IR - sy;
    const d2 = S3H * sx + 0.5 * sy + IR;
    const d3 = -S3H * sx + 0.5 * sy + IR;
    return 1.0 - Math.min(d1, d2, d3) * 1.732;
  },

  cross: (dx, dy) => {
    const arm = 0.28;
    const ax = Math.abs(dx),
      ay = Math.abs(dy);
    return Math.min(Math.max(ax / arm, ay), Math.max(ax, ay / arm));
  },
};

function getShapeDetail(shapeName: string, dx: number, dy: number) {
  const str = 0.15;
  switch (shapeName) {
    case "square": {
      const vLine = Math.exp(-Math.pow(dx * 5, 2));
      const hLine = Math.exp(-Math.pow(dy * 5, 2));
      return (vLine + hLine) * str;
    }
    case "circle": {
      const vLine = Math.exp(-Math.pow(dx * 6, 2));
      const hLine = Math.exp(-Math.pow(dy * 6, 2));
      return (vLine + hLine) * str * 0.8;
    }
    case "triangle": {
      const median = Math.exp(-Math.pow(dx * 5, 2));
      return median * str;
    }
    case "cross": {
      const dot = Math.exp(-(dx * dx + dy * dy) * 10);
      return dot * str * 1.5;
    }
    default:
      return 0;
  }
}

// ============================================
// Timing
// ============================================
const TIMING = {
  noiseDur: 5.0,
  formDur: 1.5,
  holdDur: 2.0,
  dissolveDur: 1.5,
};

const CYCLE_DUR =
  TIMING.noiseDur + TIMING.formDur + TIMING.holdDur + TIMING.dissolveDur;

const LAYOUT_A = ["square", "circle", "triangle", "cross"];
const LAYOUT_B = ["cross", "triangle", "circle", "square"];

function easeInOut(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// ============================================
// Component
// ============================================
export default function TopoBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // --- Mutable state ---
    let W = 0,
      H = 0,
      cols = 0,
      rows = 0;
    let grid: Float32Array;
    let time = Math.random() * 100;
    let mx = 0,
      my = 0,
      smx = 0,
      smy = 0;
    let cycleTime = 0;
    let swapped = false;
    let shapeAssign = [...LAYOUT_A];
    const shapeInfluence = [1, 1, 1, 1];
    let prev = performance.now();
    let rafId: number;
    // The hero canvas keeps redrawing Perlin contours even when it is scrolled
    // far off screen; nothing below the hero should pay for that.
    let onScreen = true;

    function getCorners() {
      return [
        {
          x: CFG.padding + CFG.shapeSize / 2,
          y: CFG.padding + CFG.shapeSize / 2,
        },
        {
          x: W - CFG.padding - CFG.shapeSize / 2,
          y: CFG.padding + CFG.shapeSize / 2,
        },
        {
          x: CFG.padding + CFG.shapeSize / 2,
          y: H - CFG.padding - CFG.shapeSize / 2,
        },
        {
          x: W - CFG.padding - CFG.shapeSize / 2,
          y: H - CFG.padding - CFG.shapeSize / 2,
        },
      ];
    }

    function resize() {
      // Cap at 1.5 so Retina/4K displays aren't rendering 2–3× the pixels per
      // frame — the visual difference is marginal, the perf cost is huge on
      // weaker GPUs.
      const dpr = Math.min(1.5, devicePixelRatio || 1);
      W = canvas!.parentElement?.clientWidth || innerWidth;
      H = canvas!.parentElement?.clientHeight || innerHeight;
      canvas!.width = W * dpr;
      canvas!.height = H * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(W / CFG.step) + 2;
      rows = Math.ceil(H / CFG.step) + 2;
      grid = new Float32Array(cols * rows);
    }

    function warpedValue(
      px: number,
      py: number,
      baseNoise: number,
      corners: ReturnType<typeof getCorners>
    ) {
      const halfSize = CFG.shapeSize / 2;
      let value = baseNoise;

      for (let c = 0; c < 4; c++) {
        const inf = shapeInfluence[c];
        if (inf < 0.001) continue;

        const dx = (px - corners[c].x) / halfSize;
        const dy = (py - corners[c].y) / halfSize;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const falloff = 1.0 - smoothstep(0.5, 1.8, dist);
        if (falloff < 0.001) continue;

        const sdf = shapeSDF[shapeAssign[c]](dx, dy);
        const detail = getShapeDetail(shapeAssign[c], dx, dy);
        const shapeVal = 0.5 - sdf * 0.9 + detail;

        const blend = falloff * inf;
        value = lerp(blend, value, shapeVal);
      }

      return value;
    }

    function updateTiming(dt: number) {
      cycleTime += dt;

      if (cycleTime >= CYCLE_DUR) {
        cycleTime -= CYCLE_DUR;
        swapped = !swapped;
        shapeAssign = swapped ? [...LAYOUT_B] : [...LAYOUT_A];
      }

      const t = cycleTime;
      const t1 = TIMING.noiseDur;
      const t2 = t1 + TIMING.formDur;
      const t3 = t2 + TIMING.holdDur;

      let inf = 0;

      if (t < t1) {
        inf = 0;
      } else if (t < t2) {
        inf = easeInOut((t - t1) / TIMING.formDur);
      } else if (t < t3) {
        inf = 1 - 0.04 * Math.sin(((t - t2) / TIMING.holdDur) * Math.PI);
      } else {
        inf = 1 - easeInOut((t - t3) / TIMING.dissolveDur);
      }

      shapeInfluence[0] = inf;
      shapeInfluence[1] = inf;
      shapeInfluence[2] = inf;
      shapeInfluence[3] = inf;
    }

    function buildGrid() {
      smx += (mx - smx) * 0.025;
      smy += (my - smy) * 0.025;
      const corners = getCorners();
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const px = i * CFG.step;
          const py = j * CFG.step;
          const baseNoise = fbm(
            px * CFG.scale + smx * 0.2,
            py * CFG.scale + smy * 0.2,
            time
          );
          grid[j * cols + i] = warpedValue(px, py, baseNoise, corners);
        }
      }
    }

    function drawContours() {
      for (let l = 0; l < TH.length; l++) {
        const th = TH[l];
        const main = l % 4 === 0;
        ctx!.lineWidth = main ? 1.2 : 0.7;
        ctx!.strokeStyle = `rgba(${CFG.lineRGB},${main ? 0.3 : 0.14})`;
        ctx!.beginPath();
        for (let j = 0; j < rows - 1; j++) {
          for (let i = 0; i < cols - 1; i++) {
            const v0 = grid[j * cols + i];
            const v1 = grid[j * cols + i + 1];
            const v2 = grid[(j + 1) * cols + i + 1];
            const v3 = grid[(j + 1) * cols + i];
            let idx = 0;
            if (v0 >= th) idx |= 1;
            if (v1 >= th) idx |= 2;
            if (v2 >= th) idx |= 4;
            if (v3 >= th) idx |= 8;
            const segs = SEG[idx];
            if (!segs.length) continue;
            const v = [v0, v1, v2, v3];
            const cx = i * CFG.step;
            const cy = j * CFG.step;
            for (const [a, b] of segs) {
              const p1 = ePt(a, cx, cy, v, th);
              const p2 = ePt(b, cx, cy, v, th);
              ctx!.moveTo(p1[0], p1[1]);
              ctx!.lineTo(p2[0], p2[1]);
            }
          }
        }
        ctx!.stroke();
      }
    }

    function drawCenterFade() {
      ctx!.save();
      ctx!.globalCompositeOperation = "destination-out";
      const g = ctx!.createRadialGradient(
        W / 2,
        H / 2,
        0,
        W / 2,
        H / 2,
        Math.min(W, H) * 0.45
      );
      g.addColorStop(0, "rgba(0,0,0,0.35)");
      g.addColorStop(0.55, "rgba(0,0,0,0.08)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx!.fillStyle = g;
      ctx!.fillRect(0, 0, W, H);
      ctx!.restore();
    }

    // --- Mouse handler ---
    function handleMouseMove(e: MouseEvent) {
      mx = e.clientX / W - 0.5;
      my = e.clientY / H - 0.5;
    }

    // --- Animation loop ---
    function frame(now: number) {
      // Skip the expensive Perlin + contour work while the LoadingScreen is
      // mounted — the canvas is hidden behind a black overlay, and this is
      // exactly the window where the portal-reveal mask is stressing the
      // main thread on weaker machines.
      if (!onScreen || document.documentElement.dataset.topoPaused === "1") {
        prev = now;
        rafId = requestAnimationFrame(frame);
        return;
      }

      const dt = (now - prev) / 1000;
      prev = now;
      time += dt * CFG.speed;

      updateTiming(dt);
      buildGrid();

      ctx!.clearRect(0, 0, W, H);
      drawContours();
      drawCenterFade();

      rafId = requestAnimationFrame(frame);
    }

    // --- Init ---
    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", handleMouseMove);
    rafId = requestAnimationFrame(frame);

    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
    });
    io.observe(canvas);

    return () => {
      cancelAnimationFrame(rafId);
      io.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none opacity-0 animate-[fadeIn_2s_ease-out_forwards]"
    />
  );
}
