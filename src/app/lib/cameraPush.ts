// Home page → case study, after lusion.co's project click: the camera pushes
// into the clicked card. The whole Featured Projects section scales up around
// the middle of the screen while the card's centre travels to it (so the
// other projects fly past), turning slightly toward the card; the image
// dissolves into the case study's ground, and the case study arrives on it.
//
// The home page runs the camera (components/home/useCameraPush.ts) and fires
// `project:push`; ProjectTransition fades in the ground on the same clock,
// navigates, and hands over to the case study with the same ready/done
// handshake the case-study hand-over uses (lib/handover.ts).

// Tuned in the standalone demo (Downloads/project-camera-push.html).
export const CAMERA_PUSH = {
  duration: 1500, // ms, the whole exit
  zoomAt: 0.25, // text fades first; the zoom runs the rest of the time
  overshoot: 1.2, // ends this far past just covering the screen
  tilt: 0.3, // turn and roll toward where the card was
  lens: 1400, // px, perspective for the turn
  dissolve: 2, // the ground fades in as u^dissolve
  jitter: 1, // hover focus-hunt strength
  wobble: 0.6, // damping of the image's springy focus point
  depth: 0.25, // how far the image rushes ahead of its frame on the push
  shake: 0.6, // handheld wobble, strongest mid-push
};

export type CameraPushDetail = {
  href: string;
  // performance.now() when the push started: both sides run off this clock.
  startAt: number;
  duration: number;
  zoomAt: number;
  dissolve: number;
  bgColor: string;
  bgImage: string;
};

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const fit01 = (v: number, a: number, b: number) =>
  clamp01((v - a) / (b - a));
export const cubicInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;

// How far into the zoom the camera is, u = 0…1, for a time t = 0…1.
export const pushProgress = (t: number, zoomAt: number) =>
  cubicInOut(fit01(t, zoomAt, 1));

// ── Coming back: the camera pulls out of the card it went into ──
//
// A push remembers the scroll position it left from, so the way back lands
// on the same framing. A case study being left for the home page sets the
// pending return; the home page plays the pull-out and clears it.
let lastPush: { slug: string; scrollY: number } | null = null;
export const rememberPush = (slug: string, scrollY: number) => {
  lastPush = { slug, scrollY };
};
export const lastPushFrom = () => lastPush;

let pendingReturn: { slug: string } | null = null;
export const setPendingReturn = (slug: string) => {
  pendingReturn = { slug };
};
// Read without clearing: React may render a component twice in development.
export const peekPendingReturn = () => pendingReturn;
export const clearPendingReturn = () => {
  pendingReturn = null;
};
