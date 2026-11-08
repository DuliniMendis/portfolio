import { Database, Sparkles, TrendingDown } from "lucide-react";
import Link from "next/link";
import { Stagger, StaggerItem } from "@/components/motion/Reveal";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

const cards = [
  {
    icon: Database,
    title: "Data-heavy, real-time interfaces",
    body: "Interfaces that stay fast and legible with dense data, like EEG signals synchronised with video.",
    href: "/work/seer-medical/data-viewer",
    cta: "Seer Data Viewer",
  },
  {
    icon: Sparkles,
    title: "Generative AI products",
    body: "Creative tools that turn powerful models into workflows people actually enjoy.",
    href: "/work/leonardo-ai",
    cta: "Blueprints and Flow State",
  },
  {
    icon: TrendingDown,
    title: "Platform cost and performance",
    body: "Finding where the money and milliseconds go, and removing them without slowing the team.",
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
          title="Hands on, where it counts."
          lead="I stay close to the code and the craft, because that is how you earn the right to guide others."
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
