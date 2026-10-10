// The cursor effect, picked in the Cursor Field Lab demo: Prism. Red and blue
// pull apart along the pointer's motion, over the site's images.
//
// `field` drives the motion texture (a port of lusion.co's ScreenPaint):
// stamp size, how much scrolling counts as movement, how the paint flows and
// swirls, and how much of it survives each frame. `look` is Prism's own:
// split and drag in CSS px, and how soft the colour fringe is.
export const CURSOR_FX = {
  effect: "prism",
  field: {
    radius: 1,
    scrollWeight: 3,
    push: 25,
    curlStrength: 2,
    curlScale: 0.02,
    velocityFade: 0.975,
    trailFade: 0.95,
    coreFade: 0.8,
  },
  look: { split: 40, push: 16, blur: 0.65 },
  // Headings: a tight fringe, no drag. `split` is how far (px) the red and
  // cyan copies sit from the letter; the trail's strength sets their opacity.
  text: { split: 2.5 },
} as const;
