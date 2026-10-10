"use client";

import Nav from "./Nav";
import { scrollToSocialsFooter } from "./utils";

// Thin client wrapper so the server-rendered project page can mount the
// shared Nav in its transparent variant without needing to define client
// callbacks inline.
export default function ProjectNav() {
  return (
    <Nav
      transparent
      overFooter={false}
      onSocialsClick={() => scrollToSocialsFooter(() => {})}
    />
  );
}
