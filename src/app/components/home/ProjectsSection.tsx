"use client";

import Image from "next/image";
import { useRef } from "react";
import BlurReveal from "../animations/BlurReveal";
import ProjectCard from "../animations/ProjectCard";
import type { ProjectCard as ProjectCardData } from "../../lib/home-data";
import { FRAME, FRAME_GUTTER, LINE, LINE_WEAK } from "./frame";
import StarTags from "./StarTags";
import { useCameraPush } from "./useCameraPush";
import { usePrism } from "../animations/usePrism";
import { CASE_STUDY_BG_FALLBACK } from "../../lib/handover";

const pad = (n: number) => String(n).padStart(2, "0");

// How many projects get a full row of their own (wide shot + details
// column) before the rest drop into the two-column grid.
const FEATURED = 2;

const EASE = "ease-[cubic-bezier(0.23,1,0.32,1)]";

function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg
      width="26"
      height="14"
      viewBox="0 0 26 14"
      fill="none"
      aria-hidden
      className={`shrink-0 ${className}`}
    >
      <path
        d="M2 7 H22 M16 2 L22 7 L16 12"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Screenshot + its light. The glow is a sibling of the card, so it stays put
// while ProjectCard tilts and zooms the image on top of it.
function Shot({
  project,
  side,
  sizes,
  radius,
  aspect,
  onOpen,
}: {
  project: ProjectCardData;
  side: "left" | "right";
  sizes: string;
  radius: string;
  aspect: string;
  onOpen: () => void;
}) {
  const opens = !project.comingSoon;
  const lensRef = useRef<HTMLDivElement>(null);
  usePrism(lensRef);
  return (
    <div className="relative">
      {/* The glow is a blur filter: it clears out with the text before the
          camera push starts scaling everything. */}
      <div aria-hidden data-push-fade className="shot-glow" />
      <ProjectCard side={side} radius={radius} origin={project.imageOrigin} edge>
        <div
          data-cursor={opens ? "case-study" : undefined}
          data-push-shot={opens ? project.slug : undefined}
          data-push-bg={opens ? project.bgColor : undefined}
          onClick={opens ? onOpen : undefined}
          className="relative"
        >
          {project.image ? (
            // The lens is the layer the camera push moves inside the frame
            // (focus-hunt, wobble, rush); it rests slightly larger than the
            // frame so it never shows an edge.
            <div
              ref={lensRef}
              data-push-lens
              className="relative"
              style={{
                transform: "scale(1.06)",
                transformOrigin: project.imageOrigin,
              }}
            >
              <Image
                src={project.image}
                alt={`${project.name} preview`}
                width={1600}
                height={1000}
                sizes={sizes}
                quality={90}
                className={`w-full ${aspect} object-cover object-top`}
              />
              {project.imageSoft && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  data-push-soft
                  src={project.imageSoft}
                  alt=""
                  aria-hidden
                  className="absolute inset-0 h-full w-full object-cover object-top opacity-0"
                />
              )}
            </div>
          ) : (
            // No screenshot yet: an empty frame the same shape as one.
            <div
              aria-hidden={!project.comingSoon}
              className={`hatch grid w-full ${aspect} place-items-center bg-white/[0.02]`}
            >
              {project.comingSoon && (
                <span className="text-[12px] uppercase tracking-[0.2em] text-[#f6f6f6]/40">
                  Case study coming soon
                </span>
              )}
            </div>
          )}
          <div aria-hidden className="shot-fade" />
        </div>
      </ProjectCard>
    </div>
  );
}

export default function ProjectsSection({
  projects,
}: {
  projects: ProjectCardData[];
}) {
  const featured = projects.slice(0, FEATURED);
  const rest = projects.slice(FEATURED);
  const { sceneRef, push, groundRef } = useCameraPush();
  const open = (project: ProjectCardData) =>
    push(project.slug, project.bgColor);
  // Links keep a real href (keyboard, middle-click, new tab) while a plain
  // click starts the camera push.
  const onLinkClick =
    (project: ProjectCardData) => (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      open(project);
    };

  return (
    <>
      {/* Coming back from a case study, its ground covers the page from the
          first paint while the camera pulls back out of the card (shown by
          useCameraPush). A sibling of the section, not a child, or it would
          zoom along with it. */}
      <div
        ref={groundRef}
        aria-hidden
        className="pointer-events-none fixed inset-0 z-40"
        style={{
          display: "none",
          opacity: 1,
          willChange: "opacity",
          backgroundColor: "#0a0a0a",
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url('${CASE_STUDY_BG_FALLBACK}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <section ref={sceneRef} id="projects" className="relative scroll-mt-24">
        {/* Header row */}
        <div className={`border-b ${LINE} ${FRAME_GUTTER}`}>
          <div
            data-push-fade
            className={`${FRAME} flex items-end justify-between gap-6 px-5 md:px-12 pt-24 md:pt-40 pb-8 md:pb-12`}
          >
            <BlurReveal>
              <h2 className="text-h2 text-[#f6f6f6]">
                Featured Projects
                <sup className="ml-2 text-[12px] md:text-[14px] tracking-wider text-[#f6f6f6]/40">
                  ({pad(projects.length)})
                </sup>
              </h2>
            </BlurReveal>
            <BlurReveal delay={0.1}>
              <p className="max-md:hidden max-w-[320px] pb-2 text-right text-body text-[#f6f6f6]/50">
                Product, web and mobile work, from first research to the
                shipped build.
              </p>
            </BlurReveal>
          </div>
        </div>

        {/* Featured projects: a row each, wide shot + details column */}
        {featured.map((project, i) => (
          <div
            key={project.slug}
            className={`border-b ${LINE} ${FRAME_GUTTER}`}
          >
            <article
              data-project-card
              className={`${FRAME} grid md:grid-cols-[minmax(0,1fr)_320px] lg:grid-cols-[minmax(0,1fr)_380px]`}
            >
              <div className="glow-cell relative overflow-hidden px-5 pt-8 pb-6 md:p-12">
                <Shot
                  project={project}
                  side="left"
                  radius="20px"
                  aspect="aspect-[16/10]"
                  // ~1.5x the frame: the scroll zoom (1.4) and lens (1.06)
                  // magnify the image, so a frame-sized file goes soft.
                  sizes="(min-width: 1024px) 1240px, (min-width: 768px) 90vw, 150vw"
                  onOpen={() => open(project)}
                />
              </div>

              {/* Three blocks — intro, tags, link — spread over the full cell
                  height, so they share one even gap and the link sits on the
                  bottom edge of the row. */}
              <div
                data-push-fade
                className={`flex flex-col justify-between gap-8 px-5 pb-10 md:p-12 md:border-l ${LINE_WEAK}`}
              >
                <div>
                  <span className="text-[13px] tracking-wider text-[#f6f6f6]/40">
                    {pad(i + 1)}
                  </span>
                  <h3 className="mt-3 text-subheading text-[#f6f6f6]">
                    {project.name}
                  </h3>
                  {project.tagline && (
                    <p className="mt-2 text-body text-[#f6f6f6]/50">
                      {project.tagline}
                    </p>
                  )}
                  {project.summary && (
                    <p className="mt-6 text-body text-[#f6f6f6]/70">
                      {project.summary}
                    </p>
                  )}
                </div>

                <StarTags tags={project.tags} />

                <a
                  href={`/projects/${project.slug}`}
                  onClick={onLinkClick(project)}
                  className="group/link inline-flex w-fit items-center gap-3 cursor-none uppercase tracking-wide text-[18px] text-[#f6f6f6]"
                >
                  <span className="relative pb-1">
                    View case study
                    <span className="absolute left-0 right-0 bottom-0 h-px bg-[#f6f6f6]/25" />
                    <span
                      className={`absolute left-0 right-0 bottom-0 h-px bg-[#f6f6f6] origin-left scale-x-0 transition-transform duration-500 ${EASE} group-hover/link:scale-x-100`}
                    />
                  </span>
                  <Arrow
                    className={`mb-1 transition-transform duration-500 ${EASE} group-hover/link:translate-x-1`}
                  />
                </a>
              </div>
            </article>
          </div>
        ))}

        {/* The rest: framed two-column grid */}
        {rest.length > 0 && (
          <div className={`border-b ${LINE} ${FRAME_GUTTER}`}>
            <div className={`${FRAME} grid md:grid-cols-2`}>
              {rest.map((project, i) => {
                const inLastRow = i >= rest.length - (rest.length % 2 || 2);
                return (
                  <article
                    key={project.slug}
                    data-project-card
                    className={`glow-cell group relative overflow-hidden px-5 py-8 md:p-12 ${LINE_WEAK} ${
                      i < rest.length - 1 ? "max-md:border-b" : ""
                    } ${inLastRow ? "" : "md:border-b"} ${
                      i % 2 === 0 ? "md:border-r" : ""
                    }`}
                  >
                    <Shot
                      project={project}
                      side={i % 2 === 0 ? "left" : "right"}
                      radius="16px"
                      aspect="aspect-[16/10]"
                      sizes="(min-width: 768px) 840px, 150vw"
                      onOpen={() => open(project)}
                    />

                    <div
                      data-push-fade
                      className="mt-6 md:mt-8 flex items-start justify-between gap-6"
                    >
                      <div className="min-w-0">
                        {project.comingSoon ? (
                          <div className="flex items-baseline gap-4 text-[#f6f6f6]">
                            <span className="w-[22px] shrink-0 text-[13px] tracking-wider text-[#f6f6f6]/40">
                              {pad(i + FEATURED + 1)}
                            </span>
                            <span className="pb-1 text-subheading max-md:text-[18px]">
                              {project.name}
                            </span>
                          </div>
                        ) : (
                          <a
                            href={`/projects/${project.slug}`}
                            onClick={onLinkClick(project)}
                            className="group/link flex items-baseline gap-4 cursor-none text-[#f6f6f6]"
                          >
                            <span className="w-[22px] shrink-0 text-[13px] tracking-wider text-[#f6f6f6]/40">
                              {pad(i + FEATURED + 1)}
                            </span>
                            <span className="relative pb-1 text-subheading max-md:text-[18px]">
                              {project.name}
                              <span
                                className={`absolute left-0 right-0 bottom-0 h-px bg-[#f6f6f6] origin-left scale-x-0 transition-transform duration-500 ${EASE} group-hover/link:scale-x-100`}
                              />
                            </span>
                          </a>
                        )}
                        {project.tagline && (
                          <p className="mt-1 pl-[38px] text-body text-[#f6f6f6]/50">
                            {project.tagline}
                          </p>
                        )}
                      </div>
                      {!project.comingSoon && (
                        <span
                          aria-hidden
                          className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/[0.14] text-[#f6f6f6]/70 transition-colors duration-500 ${EASE} group-hover:border-[#f6f6f6] group-hover:bg-[#f6f6f6] group-hover:text-[#111111]`}
                        >
                          <Arrow className="h-[10px] w-[18px]" />
                        </span>
                      )}
                    </div>
                  </article>
                );
              })}
              {/* An odd project out leaves half a row; hatch it so the frame
                  reads as deliberate rather than unfinished. */}
              {rest.length % 2 === 1 && (
                <div aria-hidden className="hatch max-md:hidden" />
              )}
            </div>
          </div>
        )}
      </section>
    </>
  );
}
