"use client";

import Image from "next/image";
import { useState } from "react";
import type { Video } from "../../lib/content-data";

const EASE = "ease-[cubic-bezier(0.23,1,0.32,1)]";

function PlayIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path d="M8 5.5 V18.5 L19 12 Z" fill="currentColor" />
    </svg>
  );
}

// A thumbnail that swaps itself for the YouTube player on click, so a visitor
// can watch without leaving the page. Until then nothing from YouTube loads.
export default function VideoTile({
  video,
  vertical = false,
  sizes,
}: {
  video: Video;
  vertical?: boolean;
  sizes: string;
}) {
  const [playing, setPlaying] = useState(false);
  const aspect = vertical ? "aspect-[9/16]" : "aspect-video";

  return (
    <figure className="group">
      <div
        className={`relative ${aspect} overflow-hidden rounded-[16px] bg-white/[0.04] ring-1 ring-white/[0.09]`}
      >
        {playing ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label={`Play: ${video.title}`}
            className="absolute inset-0 cursor-none"
          >
            <Image
              src={video.thumb}
              alt=""
              fill
              sizes={sizes}
              className={`object-cover transition-transform duration-700 ${EASE} group-hover:scale-[1.04]`}
            />
            <span
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0"
            />
            <span
              aria-hidden
              className={`absolute left-4 bottom-4 grid h-11 w-11 place-items-center rounded-full bg-[#f6f6f6] text-[#111111] transition-transform duration-500 ${EASE} group-hover:scale-110`}
            >
              <PlayIcon />
            </span>
            <span className="absolute right-3 bottom-3 rounded-full bg-black/70 px-2.5 py-1 text-[11px] tabular-nums tracking-wider text-[#f6f6f6]">
              {video.duration}
            </span>
          </button>
        )}
      </div>
      <figcaption className="mt-4">
        <p className="text-[17px] md:text-[19px] leading-snug text-[#f6f6f6]">
          {video.title}
        </p>
        <p className="mt-1 text-[11px] md:text-[12px] uppercase tracking-wider text-[#f6f6f6]/50">
          {video.streamer} · {video.game}
        </p>
      </figcaption>
    </figure>
  );
}
