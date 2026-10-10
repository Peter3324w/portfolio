import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

// Shared link-preview card (Reddit, X, LinkedIn, iMessage…): the site's own
// near-black with the Aeonik headline, so a shared link looks like the site.
export const OG_SIZE = { width: 1200, height: 630 };

export async function ogCard({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  // The font files are licensed separately and may be absent from a checkout;
  // the card then falls back to the renderer's built-in face instead of
  // failing the build.
  const font = await readFile(
    join(process.cwd(), "public/fonts/AeonikTRIAL-Regular.otf"),
  ).catch(() => null);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "#0a0a0a",
          color: "#f6f6f6",
          fontFamily: "Aeonik",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 24,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "rgba(246,246,246,0.5)",
          }}
        >
          {eyebrow}
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 104, lineHeight: 1 }}>
            {title}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 28,
              fontSize: 40,
              color: "rgba(246,246,246,0.65)",
            }}
          >
            {subtitle}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 24,
            color: "rgba(246,246,246,0.5)",
          }}
        >
          <span>Peter Phiri</span>
          <span>peterbuilds.vercel.app</span>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: font ? [{ name: "Aeonik", data: font, style: "normal" }] : undefined,
    },
  );
}
