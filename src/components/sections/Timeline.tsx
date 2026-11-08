import { Reveal } from "@/components/motion/Reveal";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

// Roles and dates to be added by the owner (see CONTENT.md). Order: most recent first.
const entries = [
  { company: "Canva", note: "AI design generation and cost reduction" },
  { company: "Leonardo.ai", note: "Flow State, Blueprints, and building the team" },
  { company: "Seer Medical", note: "Data Viewer, live monitoring and clinic tools" },
];

export function Timeline() {
  return (
    <section className="border-t border-border bg-surface py-24 md:py-32">
      <Container>
        <SectionHeading eyebrow="Path" title="Where I have worked." />
        <ol className="mt-14 divide-y divide-border border-y border-border">
          {entries.map((e) => (
            <Reveal key={e.company} as="li" className="flex flex-col gap-1 py-6 md:flex-row md:items-baseline md:justify-between">
              <span className="font-display text-2xl font-semibold">{e.company}</span>
              <span className="text-muted">{e.note}</span>
            </Reveal>
          ))}
        </ol>
      </Container>
    </section>
  );
}
