// The black lower half of the home page (Featured Projects → CTA → footer)
// sits inside one frame: hairline rails on the same edges as the nav's
// content box, so every cell, divider and heading lines up with the nav.
export const FRAME_GUTTER = "px-6 md:px-12";
export const FRAME = "mx-auto w-full max-w-[1296px]";
// Rails and full-bleed rules between rows.
export const LINE = "border-white/[0.16]";
// Dividers inside the frame (between cells, columns).
export const LINE_WEAK = "border-white/[0.09]";

// Ink versions of the same hairlines, for sections that sit on the light
// background (the skills grid) so the frame reads the same either way.
export const LINE_INK = "border-[#111111]/14";
export const LINE_INK_WEAK = "border-[#111111]/8";
