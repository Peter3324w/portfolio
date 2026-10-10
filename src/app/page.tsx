import HomeShell from "./components/home/HomeShell";
import StatementSection from "./components/home/StatementSection";
import DarkZone from "./components/home/DarkZone";
import ProjectsSection from "./components/home/ProjectsSection";
import ProcessSection from "./components/home/ProcessSection";
import SkillsAndCtaSection from "./components/home/SkillsAndCtaSection";
import {
  CODE_SKILLS,
  PROCESS_STEPS,
  PROJECTS,
  SKILLS,
  STACK,
} from "./lib/home-data";

// Server component: composes the page as a static shell. HomeShell (client)
// wraps the orchestration state (LoadingScreen, Nav, overFooter, Footer) and
// renders the HeroSection directly; the rest of the sections flow through as
// children. Sections that don't need state (StatementSection, ProcessSection)
// render on the server — only the interactive islands hydrate.
export default function Home() {
  return (
    <HomeShell>
      <StatementSection />
      <DarkZone>
        <ProjectsSection projects={PROJECTS} />
        <ProcessSection steps={PROCESS_STEPS} />
      </DarkZone>
      {/* Back to the light background, same frame and hairlines */}
      <SkillsAndCtaSection
        skills={SKILLS}
        codeSkills={CODE_SKILLS}
        stack={STACK}
      />
    </HomeShell>
  );
}
