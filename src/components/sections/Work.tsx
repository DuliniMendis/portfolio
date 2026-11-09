import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Stagger, StaggerItem } from "@/components/motion/Reveal";
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
                {/* Faded backdrop: a screenshot where there is one, otherwise a soft palette wash.
                    It fades out towards the bottom so the teaser and tags sit on plain white. */}
                <div
                  aria-hidden
                  className="absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,black,transparent_75%)]"
                >
                  {p.cover ? (
                    <Image
                      src={p.cover}
                      alt=""
                      fill
                      sizes="(min-width: 768px) 33vw, 100vw"
                      className="object-cover object-left-top opacity-20 transition-opacity duration-500 group-hover:opacity-35"
                    />
                  ) : (
                    <div className="h-full w-full bg-[radial-gradient(circle_at_20%_10%,var(--sky),transparent_60%),radial-gradient(circle_at_90%_30%,var(--peach),transparent_55%)] transition-opacity duration-500 group-hover:opacity-80" />
                  )}
                </div>
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
