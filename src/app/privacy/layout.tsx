import type { Metadata } from "next";

// The page itself is a client component, so its metadata lives here.
export const metadata: Metadata = {
  title: "Privacy",
  openGraph: { title: "Privacy | Peter Phiri", url: "/privacy" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
