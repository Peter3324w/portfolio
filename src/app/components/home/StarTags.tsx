// Small white star marking each tag.
function Star() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      aria-hidden
      className="shrink-0 text-[#f6f6f6]"
    >
      <path
        d="M5 0 C5.4 2.9 7.1 4.6 10 5 C7.1 5.4 5.4 7.1 5 10 C4.6 7.1 2.9 5.4 0 5 C2.9 4.6 4.6 2.9 5 0 Z"
        fill="currentColor"
      />
    </svg>
  );
}

// The site's one tag style: uppercase labels, each led by a star.
export default function StarTags({
  tags,
  className = "",
}: {
  tags: string[];
  className?: string;
}) {
  return (
    <ul className={`flex flex-wrap gap-x-5 gap-y-2 ${className}`}>
      {tags.map((tag) => (
        <li
          key={tag}
          className="inline-flex items-center gap-2 text-[11px] md:text-[12px] uppercase tracking-wider text-[#f6f6f6]/60"
        >
          <Star />
          {tag}
        </li>
      ))}
    </ul>
  );
}
