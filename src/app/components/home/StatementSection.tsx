import BlurReveal from "../animations/BlurReveal";
import ScrollLine from "../animations/ScrollLine";

// Server component — static markup. BlurReveal + ScrollLine are client
// components, which is fine: RSC can render client components as children.
export default function StatementSection() {
  return (
    <section className="relative bg-[#f6f6f6] py-16 md:py-32 px-6 md:px-12">
      <ScrollLine className="hidden md:block" />
      <div className="flex flex-col xl:flex-row items-start justify-between gap-8 xl:gap-12 max-w-[1200px] mx-auto">
        <BlurReveal>
          <h2 className="text-h2 text-[#111111]" style={{ fontWeight: 400 }}>
            2 years in, 12 projects deep —<br />still obsessed with getting
            <br />it right.
          </h2>
        </BlurReveal>

        <BlurReveal delay={0.15}>
          <p className="text-body text-[#111111]/70 max-w-[490px] xl:max-w-[400px] mt-0 xl:mt-[120px]">
            Two years of learning, unlearning, and refining — I design digital
            products that bridge the gap between what users need and what
            businesses want, without sacrificing either.
          </p>
        </BlurReveal>
      </div>
    </section>
  );
}
