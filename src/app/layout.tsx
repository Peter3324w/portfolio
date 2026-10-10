import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import SmoothScroll from "./components/SmoothScroll";
import CustomCursor from "./components/cursor/CustomCursor";
import PrismText from "./components/PrismText";
import ProjectTransition from "./components/ProjectTransition";

const DESCRIPTION =
  "Peter Phiri designs and builds web apps, desktop apps and landing pages, from the first wireframe to the shipped product.";

export const metadata: Metadata = {
  metadataBase: new URL("https://peterbuilds.vercel.app"),
  title: {
    default: "Peter Phiri | Product Designer & Front-end Developer",
    template: "%s | Peter Phiri",
  },
  description: DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: "Peter Phiri",
    title: "Peter Phiri | Product Designer & Front-end Developer",
    description: DESCRIPTION,
    url: "/",
  },
  twitter: { card: "summary_large_image", creator: "@203Peter" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-[#f6f6f6]">
      <body className="bg-black text-white antialiased overflow-x-clip">
        <SmoothScroll />
        <CustomCursor />
        <PrismText />
        <ProjectTransition />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
