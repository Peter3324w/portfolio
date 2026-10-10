import { OG_SIZE, ogCard } from "./lib/ogCard";

export const alt = "Peter Phiri, product designer and front-end developer";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return ogCard({
    eyebrow: "Portfolio",
    title: "Peter Phiri",
    subtitle: "Product designer and front-end developer",
  });
}
