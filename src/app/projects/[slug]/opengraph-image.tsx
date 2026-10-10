import { OG_SIZE, ogCard } from "../../lib/ogCard";
import { PROJECTS, UNLISTED_PROJECTS } from "../../lib/home-data";

export const alt = "Case study by Peter Phiri";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const card = [...PROJECTS, ...UNLISTED_PROJECTS].find((p) => p.slug === slug);

  return ogCard({
    eyebrow: "Case study",
    title: card?.name ?? "Peter Phiri",
    subtitle: card?.tagline ?? "Product designer and front-end developer",
  });
}

export function generateStaticParams() {
  return [...PROJECTS, ...UNLISTED_PROJECTS]
    .filter((p) => !p.comingSoon)
    .map((p) => ({ slug: p.slug }));
}
