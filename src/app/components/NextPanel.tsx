import type React from "react";

// The "next case study" panel's colours, size and furniture. Shared by the
// panel at the end of the ribbon and the take-over layer that grows out of
// it (ProjectTransition), so the two match frame for frame.
export const NEXT_PANEL_BG = "#f6f6f6";
export const NEXT_PANEL_INK = "#111111";
export const NEXT_TITLE_GREY = "#c2c3c7";
export const NEXT_PANEL_WIDTH = "min(360px, 34vw)";
// The case study title. The panel's preview title and the intro tile's h1
// both use it, so the preview can become the next page's title.
export const CASE_TITLE_CLASS =
  "text-[56px] lg:text-[72px] leading-[0.95] font-normal tracking-[-0.02em] whitespace-nowrap";

// Label, hint and the over-scroll meter. The meter's fill reads --fill from
// the nearest ancestor that sets it.
export function NextPanelDecor({
  hintRef,
  showHint = true,
}: {
  hintRef?: React.Ref<HTMLSpanElement>;
  showHint?: boolean;
}) {
  return (
    <>
      <span
        className="absolute left-10 top-24 text-[11px] uppercase tracking-[0.25em]"
        style={{ color: `${NEXT_PANEL_INK}8c` }}
      >
        Next case study
      </span>
      {showHint && (
        <span
          ref={hintRef}
          className="absolute left-10 bottom-[76px] text-[11px] tracking-[0.06em]"
          style={{
            color: `${NEXT_PANEL_INK}73`,
            transition: "opacity 0.4s ease",
          }}
        >
          Keep scrolling
        </span>
      )}
      <span
        className="absolute left-10 right-8 bottom-10 flex items-center gap-3.5 text-[12px] uppercase tracking-[0.08em]"
        style={{ color: NEXT_PANEL_INK }}
      >
        Next project
        <span
          className="relative h-px flex-1 overflow-hidden"
          style={{ backgroundColor: `${NEXT_PANEL_INK}2e` }}
        >
          <span
            className="absolute inset-0 origin-left"
            style={{
              backgroundColor: NEXT_PANEL_INK,
              transform: "scaleX(var(--fill, 0))",
            }}
          />
        </span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M5 12h14M13 6l6 6-6 6"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </>
  );
}
