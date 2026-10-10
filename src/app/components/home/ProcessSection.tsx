import ScrollAccordion from "../animations/ScrollAccordion";
import type { ProcessStep } from "../../lib/home-data";
import { FRAME, FRAME_GUTTER, LINE } from "./frame";

// Server component — a hatch band (the break between Featured Projects and
// the process) plus ScrollAccordion (client) with its static props.
export default function ProcessSection({ steps }: { steps: ProcessStep[] }) {
  return (
    <section className="relative">
      <div aria-hidden className={`border-b ${LINE} ${FRAME_GUTTER}`}>
        <div className={`${FRAME} hatch h-16 md:h-24`} />
      </div>
      <ScrollAccordion
        label="My process"
        heading={"The real work that\nhappens long before\nthe finish"}
        mobileHeading={"The real work\nthat happens\nlong before\nthe finish"}
        items={steps}
      />
    </section>
  );
}
