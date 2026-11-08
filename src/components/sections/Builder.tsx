import { Database, Sparkles, TrendingDown } from "lucide-react";
import Link from "next/link";
import { Stagger, StaggerItem } from "@/components/motion/Reveal";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

const cards = [
  {
    icon: Database,
    title: "Screens full of live data",
    body: "Making dense data easy to read and quick to use, like days of EEG lined up with video.",
    href: "/work/seer-medical/data-viewer",
    cta: "Seer Data Viewer",
  },
  {
    icon: Sparkles,
    title: "AI products people enjoy",
    body: "Flow State and Blueprints turn powerful image models into tools you can pick up without learning prompt tricks.",
    href: "/work/leonardo-ai",
    cta: "Flow State and Blueprints",
  },
  {
    icon: TrendingDown,
    title: "Making AI cheaper to run",
    body: "At Canva I halved the cost of one of Canva AI's ways of making designs by moving it to cheaper models, without hurting design quality.",
    href: "/work/canva/cost-reduction",
    cta: "Canva cost reduction",
  },
];

export function Builder() {
  return (
    <section className="py-24 md:py-32">
      <Container>
        <SectionHeading
          eyebrow="Builder"
          title="I still build things."
          lead="I stay close to the code. It&apos;s hard to lead engineers well once you&apos;ve stopped building yourself."
        />
        <Stagger className="mt-14 grid gap-6 md:grid-cols-3">
          {cards.map(({ icon: Icon, title, body, href, cta }) => (
            <StaggerItem key={title}>
              <Link
                href={href}
                className="group flex h-full flex-col rounded-card border border-border bg-surface p-8 transition-all hover:-translate-y-1 hover:border-ink hover:shadow-lg"
              >
                <Icon className="text-blue" size={28} />
                <h3 className="mt-6 text-2xl font-semibold">{title}</h3>
                <p className="mt-3 flex-1 text-muted">{body}</p>
                <span className="mt-6 text-sm font-medium group-hover:text-blue-text">{cta} →</span>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </section>
  );
}
