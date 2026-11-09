import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Stagger, StaggerItem } from "@/components/motion/Reveal";
import { CardBackdrop } from "@/components/ui/CardBackdrop";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Tag } from "@/components/ui/Tag";
import { featuredSections, projects } from "@/content/projects";

export function Work() {
  return (
    <section id="work" className="scroll-mt-20 py-24 md:py-32">
      <Container>
        <SectionHeading
          eyebrow="Selected work"
          title="Three companies, and what I did at each."
        />
        <Stagger className="mt-14 grid gap-6 md:grid-cols-3">
          {projects.map((p) => (
            <StaggerItem key={p.slug}>
              <Link
                href={`/work/${p.slug}`}
                className="group relative isolate flex h-full min-h-72 flex-col overflow-hidden rounded-card border border-border bg-surface p-8 transition-all hover:-translate-y-1 hover:border-ink hover:shadow-lg"
              >
                <CardBackdrop colors={p.brand} />
                <div className="flex items-start justify-between">
                  <h3 className="text-3xl font-semibold">{p.name}</h3>
                  <ArrowUpRight className="text-muted transition-colors group-hover:text-blue" />
                </div>
                <p className="mt-4 flex-1 text-ink/80">{p.teaser}</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {featuredSections(p).map((s) => (
                    <Tag key={s.slug}>{s.title}</Tag>
                  ))}
                </div>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </section>
  );
}
