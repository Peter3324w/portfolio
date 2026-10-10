import type { Metadata } from "next";
import ProjectNav from "../components/ProjectNav";
import BlurReveal from "../components/animations/BlurReveal";
import StarTags from "../components/home/StarTags";
import { FRAME, FRAME_GUTTER, LINE, LINE_WEAK } from "../components/home/frame";
import VideoTile from "../components/content/VideoTile";
import CopyDiscord from "../components/content/CopyDiscord";
import {
  CHANNEL_URL,
  DISCORD,
  EMAIL,
  GAMES,
  PROCESS,
  SERVICES,
  SHORTS,
  STARTER,
  TOOLS,
  VIDEOS,
  X_URL,
} from "../lib/content-data";

const DESCRIPTION =
  "I turn Twitch streams into YouTube highlight videos and Shorts, for League of Legends, Apex and Battlefield streamers.";

export const metadata: Metadata = {
  title: "Content Creation",
  description: DESCRIPTION,
  openGraph: {
    title: "Content Creation | Peter Phiri",
    description: DESCRIPTION,
    url: "/content-creation",
  },
};

const pad = (n: number) => String(n).padStart(2, "0");

// The site's pill button, dark-surface version: a light fill wipes in from
// the left on hover and the label flips to ink.
const PILL =
  "group relative inline-flex items-center gap-2 overflow-hidden rounded-full px-5 py-3 text-[13px] uppercase tracking-wider cursor-none";
const PILL_FILL =
  "absolute inset-0 origin-left scale-x-0 transition-transform duration-400 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-x-100";
const PILL_TEXT = "relative z-[1] transition-colors duration-300 delay-100";

function Pill({
  href,
  children,
  solid = false,
  external = false,
}: {
  href: string;
  children: React.ReactNode;
  solid?: boolean;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={`${PILL} ${solid ? "bg-[#f6f6f6]" : "bg-white/[0.08]"}`}
    >
      <span className={`${PILL_FILL} ${solid ? "bg-white/[0.16]" : "bg-[#f6f6f6]"}`} />
      <span
        className={`${PILL_TEXT} ${
          solid ? "text-[#111111]" : "text-[#f6f6f6] group-hover:text-[#111111]"
        }`}
      >
        {children}
      </span>
    </a>
  );
}

// A section heading row, matching Featured Projects on the home page.
function SectionHead({
  title,
  count,
  note,
}: {
  title: string;
  count?: number;
  note?: string;
}) {
  return (
    <div className={`border-b ${LINE} ${FRAME_GUTTER}`}>
      <div
        className={`${FRAME} flex items-end justify-between gap-6 px-5 md:px-12 pt-20 md:pt-32 pb-8 md:pb-12`}
      >
        <BlurReveal>
          <h2 className="text-h2 text-[#f6f6f6]">
            {title}
            {count !== undefined && (
              <sup className="ml-2 text-[12px] md:text-[14px] tracking-wider text-[#f6f6f6]/40">
                ({pad(count)})
              </sup>
            )}
          </h2>
        </BlurReveal>
        {note && (
          <BlurReveal delay={0.1}>
            <p className="max-md:hidden max-w-[340px] pb-2 text-right text-body text-[#f6f6f6]/50">
              {note}
            </p>
          </BlurReveal>
        )}
      </div>
    </div>
  );
}

export default function ContentCreationPage() {
  return (
    <main
      data-cursor-theme="light"
      className="relative min-h-screen bg-black text-[#f6f6f6]"
    >
      <ProjectNav />

      {/* The frame's two rails, over the whole page. */}
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 z-[3] ${FRAME_GUTTER}`}
      >
        <div className={`${FRAME} h-full border-x ${LINE}`} />
      </div>

      {/* ─── Hero ─── */}
      <section className={`border-b ${LINE} ${FRAME_GUTTER}`}>
        <div className={`${FRAME} px-5 md:px-12 pt-36 md:pt-48 pb-16 md:pb-24`}>
          <BlurReveal>
            <p className="mb-6 text-[12px] uppercase tracking-[0.2em] text-[#f6f6f6]/50">
              Content Creation · Video Editing
            </p>
          </BlurReveal>
          <BlurReveal delay={0.06}>
            <h1 className="text-h1 max-w-[900px] text-[#f6f6f6]">
              Your best moments on stream, cut for YouTube.
            </h1>
          </BlurReveal>
          <BlurReveal delay={0.12}>
            <p className="mt-6 max-w-[620px] text-body text-[#f6f6f6]/60">
              Your best plays happen live, and most of your audience misses
              them. I turn your streams into YouTube highlight videos and
              Shorts, so the moments keep finding new viewers after you go
              offline.
            </p>
          </BlurReveal>
          <BlurReveal delay={0.18}>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Pill href="#contact" solid>
                Work with me
              </Pill>
              <Pill href={CHANNEL_URL} external>
                Watch the channel
              </Pill>
            </div>
          </BlurReveal>
          <BlurReveal delay={0.24}>
            <StarTags tags={GAMES} className="mt-14" />
          </BlurReveal>
        </div>
      </section>

      {/* ─── Highlight videos ─── */}
      <section>
        <SectionHead
          title="Highlight Videos"
          count={VIDEOS.length}
          note="Full streams cut down to 6–12 minutes. Click any video to watch it here."
        />
        <div className={`border-b ${LINE} ${FRAME_GUTTER}`}>
          <div className={`${FRAME} grid md:grid-cols-2`}>
            {VIDEOS.map((video, i) => (
              <div
                key={video.id}
                className={`p-5 md:p-10 ${
                  i % 2 === 0 ? `md:border-r ${LINE_WEAK}` : ""
                } ${i < VIDEOS.length - 2 ? `border-b ${LINE_WEAK}` : ""} ${
                  i === VIDEOS.length - 2 ? `max-md:border-b ${LINE_WEAK}` : ""
                }`}
              >
                <BlurReveal delay={(i % 2) * 0.08}>
                  <VideoTile
                    video={video}
                    sizes="(min-width: 768px) 600px, 100vw"
                  />
                </BlurReveal>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Shorts ─── */}
      <section>
        <SectionHead
          title="Shorts"
          count={SHORTS.length}
          note="Vertical clips for YouTube Shorts, TikTok and Instagram Reels."
        />
        <div className={`border-b ${LINE} ${FRAME_GUTTER}`}>
          <div className={`${FRAME} grid grid-cols-2 md:grid-cols-4`}>
            {SHORTS.map((video, i) => (
              <div
                key={video.id}
                className={`p-4 md:p-8 border-r ${LINE_WEAK} ${
                  i === SHORTS.length - 1 ? "max-md:border-r-0" : ""
                }`}
              >
                <BlurReveal delay={i * 0.08}>
                  <VideoTile
                    video={video}
                    vertical
                    sizes="(min-width: 768px) 300px, 50vw"
                  />
                </BlurReveal>
              </div>
            ))}
            {/* The rest of the row points to the channel, where every clip
                lives. */}
            <a
              href={CHANNEL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`group hatch max-md:col-span-2 max-md:border-t ${LINE_WEAK} md:col-span-2 flex flex-col justify-end gap-3 p-6 md:p-10 cursor-none`}
            >
              <p className="text-subheading text-[#f6f6f6]">
                More on the channel
              </p>
              <p className="text-body text-[#f6f6f6]/50">
                Every edit is posted on OnetapTV, my own channel.
              </p>
              <span className="mt-2 inline-flex items-center gap-2 text-[12px] uppercase tracking-wider text-[#f6f6f6]/70 transition-colors duration-300 group-hover:text-[#f6f6f6]">
                OnetapTV on YouTube
                <svg width="22" height="12" viewBox="0 0 26 14" fill="none" aria-hidden>
                  <path
                    d="M2 7 H22 M16 2 L22 7 L16 12"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* ─── How it works ─── */}
      <section>
        <SectionHead title="How It Works" />
        <div className={`border-b ${LINE} ${FRAME_GUTTER}`}>
          <ol className={`${FRAME} grid sm:grid-cols-2 lg:grid-cols-4`}>
            {PROCESS.map((step, i) => (
              <li
                key={step.title}
                className={`p-6 md:p-10 border-b ${LINE_WEAK} lg:border-b-0 ${
                  i < PROCESS.length - 1 ? `lg:border-r ${LINE_WEAK}` : ""
                } ${i % 2 === 0 ? `sm:border-r ${LINE_WEAK}` : ""} ${
                  i >= PROCESS.length - 2 ? "sm:border-b-0" : ""
                } ${i === PROCESS.length - 1 ? "max-sm:border-b-0" : ""}`}
              >
                <BlurReveal delay={i * 0.06}>
                  <p className="text-[12px] tabular-nums tracking-wider text-[#f6f6f6]/40">
                    {pad(i + 1)}
                  </p>
                  <p className="mt-8 md:mt-14 text-subheading text-[#f6f6f6]">
                    {step.title}
                  </p>
                  <p className="mt-3 text-body text-[#f6f6f6]/55">
                    {step.body}
                  </p>
                </BlurReveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ─── Services ─── */}
      <section>
        <SectionHead
          title="Services"
          count={SERVICES.length}
          note="Pick one, or mix them into a weekly plan. Rates on request."
        />
        <div className={`border-b ${LINE} ${FRAME_GUTTER}`}>
          <div className={`${FRAME} grid md:grid-cols-3`}>
            {SERVICES.map((service, i) => (
              <div
                key={service.title}
                className={`p-6 md:p-10 border-b ${LINE_WEAK} ${
                  i % 3 !== 2 ? `md:border-r ${LINE_WEAK}` : ""
                } ${i >= 3 ? "md:border-b-0" : ""}`}
              >
                <BlurReveal delay={(i % 3) * 0.06}>
                  <p className="text-subheading text-[#f6f6f6]">
                    {service.title}
                  </p>
                  <p className="mt-3 text-body text-[#f6f6f6]/55">
                    {service.body}
                  </p>
                </BlurReveal>
              </div>
            ))}
            {/* The starter package fills the last cell of the grid. */}
            <div className="relative overflow-hidden p-6 md:p-10 bg-white/[0.03]">
              <BlurReveal>
                <p className="text-[12px] uppercase tracking-[0.2em] text-[#f6f6f6]/50">
                  Best place to start
                </p>
                <p className="mt-4 text-subheading text-[#f6f6f6]">
                  {STARTER.title}
                </p>
                <StarTags
                  tags={STARTER.items}
                  className="mt-5 flex-col !gap-y-3"
                />
              </BlurReveal>
            </div>
          </div>
        </div>
        <div className={`border-b ${LINE} ${FRAME_GUTTER}`}>
          <div
            className={`${FRAME} flex flex-wrap items-center gap-x-6 gap-y-3 px-5 md:px-12 py-6`}
          >
            <span className="text-[12px] uppercase tracking-[0.2em] text-[#f6f6f6]/40">
              Edited in
            </span>
            <StarTags tags={TOOLS} />
          </div>
        </div>
      </section>

      {/* ─── Contact ─── */}
      <section id="contact" className={`scroll-mt-24 ${FRAME_GUTTER}`}>
        <div
          className={`${FRAME} px-5 md:px-12 pt-24 md:pt-40 pb-28 md:pb-40 text-center`}
        >
          <BlurReveal>
            <h2 className="text-h1 mx-auto max-w-[820px] text-[#f6f6f6]">
              Got a stream worth watching twice?
            </h2>
          </BlurReveal>
          <BlurReveal delay={0.08}>
            <p className="mx-auto mt-6 max-w-[520px] text-body text-[#f6f6f6]/60">
              Send me a VOD and tell me what you&apos;re after. I&apos;ll
              reply with what I&apos;d cut from it and what that would cost.
            </p>
          </BlurReveal>
          <BlurReveal delay={0.14}>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Pill href={`mailto:${EMAIL}?subject=Editing`} solid>
                Email me
              </Pill>
              {DISCORD && (
                <CopyDiscord
                  handle={DISCORD}
                  className={`${PILL} bg-white/[0.08] text-[#f6f6f6] transition-colors duration-300 hover:bg-white/[0.16]`}
                />
              )}
              <Pill href={X_URL} external>
                Message on X
              </Pill>
            </div>
          </BlurReveal>
          <BlurReveal delay={0.2}>
            <p className="mt-8 text-[12px] tracking-wider text-[#f6f6f6]/40">
              {EMAIL}
            </p>
          </BlurReveal>
        </div>
      </section>
    </main>
  );
}
