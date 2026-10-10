import Image from "next/image";
import { PROCESS_STEPS, PROJECTS } from "../../lib/home-data";

// What hangs in the corridor between the skills grid and the contact
// section. Farthest first: planes paint in DOM order, so DOM order is depth
// order. `data-z` is depth in px along a 7000px corridor; `data-x`/`data-y`
// are offsets as fractions of the viewport. useFlyThrough does the rest.
//
// Desktop only; phones keep the stacked layout.

const GATE_DEPTHS = [-1000, -2450, -3950, -5500];
const SCREENS = [
  { z: -1750, x: -0.27, y: -0.06 },
  { z: -3200, x: 0.27, y: 0.07 },
];

// Every plane is centred in the stage by inset + auto margins rather than a
// translate, so the per-frame transform is the depth move and nothing else.
const PLANE = "pointer-events-none absolute inset-0 m-auto max-md:hidden";

function Tick({ className }: { className: string }) {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 13 13"
      aria-hidden
      className={`absolute ${className}`}
    >
      <path d="M6.5 0v13M0 6.5h13" stroke="rgba(255,255,255,0.55)" />
    </svg>
  );
}

// One gate per process step: a hairline frame the camera passes through.
function Gate({ z, index }: { z: number; index: number }) {
  const [number, name] = PROCESS_STEPS[index].title.split(" — ");
  const word = name.split(" ").pop();
  return (
    <div
      data-fly="gate"
      data-z={z}
      aria-hidden
      className={`${PLANE} h-[78%] w-[86%] border border-white/[0.16]`}
    >
      <Tick className="-left-[7px] -top-[7px]" />
      <Tick className="-right-[7px] -top-[7px]" />
      <Tick className="-left-[7px] -bottom-[7px]" />
      <Tick className="-right-[7px] -bottom-[7px]" />
      <span className="absolute left-6 top-5 text-[12px] uppercase tracking-[0.2em] text-[#f6f6f6]/50">
        <span className="mr-3 text-[#f6f6f6]">{number}</span>
        {name}
      </span>
      <span className="absolute bottom-[6px] left-[22px] whitespace-nowrap text-[clamp(64px,11vw,176px)] leading-[0.9] tracking-[-0.03em] text-[#f6f6f6]/[0.07]">
        {word}
      </span>
    </div>
  );
}

// Soft light behind a floating panel: a gradient, never a blur filter.
function Glow() {
  return (
    <div
      aria-hidden
      className="absolute -inset-x-[25%] -inset-y-[35%] -z-10 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.09),rgba(255,255,255,0)_62%)]"
    />
  );
}

type Item =
  | { kind: "gate"; z: number; step: number }
  | { kind: "screen"; z: number; x: number; y: number; slug: string }
  | { kind: "code"; z: number; x: number; y: number };

const CODE = { z: -4700, x: -0.25, y: 0.1 };

export default function FlyCorridor() {
  const screens = PROJECTS.filter((p) => p.image).slice(0, SCREENS.length);
  const items: Item[] = [
    ...GATE_DEPTHS.map((z, step) => ({ kind: "gate" as const, z, step })),
    ...screens.map((p, i) => ({ kind: "screen" as const, slug: p.slug, ...SCREENS[i] })),
    { kind: "code" as const, ...CODE },
  ].sort((a, b) => a.z - b.z);

  return (
    <>
      {items.map((item) => {
        if (item.kind === "gate") {
          return <Gate key={`gate-${item.step}`} z={item.z} index={item.step} />;
        }
        if (item.kind === "screen") {
          const project = screens.find((p) => p.slug === item.slug)!;
          return (
            <figure
              key={item.slug}
              data-fly="panel"
              data-z={item.z}
              data-x={item.x}
              data-y={item.y}
              className={`${PLANE} isolate h-fit w-[min(560px,42vw)] rounded-2xl border border-white/[0.16] bg-[#0a0a0a] p-2.5`}
            >
              <Glow />
              <Image
                src={project.image!}
                alt={`${project.name} screen`}
                width={1600}
                height={1000}
                sizes="560px"
                className="block h-auto w-full rounded-[9px]"
              />
              <figcaption className="flex justify-between gap-3 px-1.5 pb-1 pt-3 text-[12px] tracking-wide text-[#f6f6f6]/50">
                <span className="text-[#f6f6f6]">{project.name}</span>
                <span>{project.tagline}</span>
              </figcaption>
            </figure>
          );
        }
        // The contact section's own code, a wink before you reach it.
        return (
          <div
            key="code"
            data-fly="panel"
            data-z={item.z}
            data-x={item.x}
            data-y={item.y}
            aria-hidden
            className={`${PLANE} isolate h-fit w-[min(440px,40vw)] rounded-2xl border border-white/[0.16] bg-[#0a0a0a]`}
          >
            <Glow />
            <div className="flex items-center gap-2 border-b border-white/[0.09] px-4 py-3 font-mono text-[12px] text-[#f6f6f6]/50">
              <i className="h-2 w-2 rounded-full bg-white/[0.16]" />
              <i className="h-2 w-2 rounded-full bg-white/[0.16]" />
              <i className="h-2 w-2 rounded-full bg-white/[0.16]" />
              <span className="ml-1.5">Contact.tsx</span>
            </div>
            <pre className="m-0 overflow-hidden px-5 pb-5 pt-4 font-mono text-[13.5px] leading-[1.75] text-[#f6f6f6]/80">
              <span className="text-[#f6f6f6]/40">export function</span>{" "}
              <span className="text-[#f6f6f6]">Contact</span>() {"{\n  "}
              <span className="text-[#f6f6f6]/40">return</span>
              {" (\n    <"}
              <span className="text-[#f6f6f6]">Button</span> href=
              <span className="text-[#9aa8ff]">&quot;mailto:…&quot;</span>
              {">\n      Get in touch\n    </"}
              <span className="text-[#f6f6f6]">Button</span>
              {">\n  );\n}"}
            </pre>
          </div>
        );
      })}
    </>
  );
}
