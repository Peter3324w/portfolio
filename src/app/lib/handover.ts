// The case study → next case study hand-over, after lusion.co: keep
// scrolling at the end of a ribbon and a meter fills; when it's full, the
// next project's panel takes over the screen, turns into that project's
// background, and the next case study appears in exactly that frame.
//
// The source page measures and fires `project:handover`; ProjectTransition
// (in the root layout, so it survives the route change) runs the take-over
// layer and navigates; the destination page starts in the layer's final frame,
// fires `project:handoverReady`, and plays its entrance on
// `project:handoverDone`.

// Tuned in the standalone demo (Downloads/case-study-handover.html).
export const HANDOVER = {
  fill: 900, // px of scrolling past the end to fill the meter
  drain: 1.2, // meter drained per second once scrolling stops
  expand: 1000, // ms for the panel to take over the screen
  morph: 0.7, // point of the take-over where the colour change starts
  lead: 0.3, // how far the title runs ahead of the panel
  enter: 1200, // ms for the title's glide into place on arrival
};

export type HandoverDetail = {
  href: string;
  name: string;
  panelLeft: number;
  panelWidth: number;
  titleFrom: { x: number; y: number };
  titleTo: { x: number; y: number };
  bgColor: string;
  bgImage: string;
  textColor: string;
};

// The texture every case study sits on unless it names its own.
export const CASE_STUDY_BG_FALLBACK = "/images/case-study-bg.jpg";

// The one piece of state that crosses the route change: how the incoming
// case study is being arrived at, so it can start in the transition's last
// frame. A hand-over leaves the next project's title at (titleX, titleY); the
// home page's camera push (lib/cameraPush.ts) leaves the bare ground.
export type HandoverArrival =
  | { kind: "handover"; titleX: number; titleY: number }
  | { kind: "camera" };

let pending: HandoverArrival | null = null;

export const setHandoverArrival = (arrival: HandoverArrival) => {
  pending = arrival;
};
// Read without clearing: React may render a component twice in development.
export const peekHandoverArrival = () => pending;
export const clearHandoverArrival = () => {
  pending = null;
};
