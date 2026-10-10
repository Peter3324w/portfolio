"use client";

import { useState } from "react";

// Discord has no link to a user, so the handle is copied instead.
export default function CopyDiscord({
  handle,
  className,
}: {
  handle: string;
  className: string;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard?.writeText(handle).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1800);
        });
      }}
      className={className}
    >
      {copied ? "Copied" : `Discord · ${handle}`}
    </button>
  );
}
