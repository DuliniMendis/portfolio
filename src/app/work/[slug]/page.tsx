import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { CARD_ICON, CardBackdrop } from "@/components/ui/CardBackdrop";
import { Container } from "@/components/ui/Container";
import { Tag } from "@/components/ui/Tag";
import { BackLink } from "@/components/work/BackLink";
import { ProjectPager } from "@/components/work/ProjectPager";
import { KIND_LABEL, finalCopy, getProject, projects } from "@/content/projects";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/work/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  return project ? { title: `${project.name} · Dulini Mendis`, description: project.summary } : {};
}

export default async function ProjectPage({ params }: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const role = finalCopy(project.role);
  const period = finalCopy(project.period);

  return (
    <>
      <section className="py-16 md:py-24">
        <Container>
          <BackLink href="/#work">All work</BackLink>
          <Reveal className="mt-10 max-w-3xl">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-blue-text">
              Selected work
            </p>
            <h1 className="mt-3 text-5xl font-semibold leading-tight md:text-7xl">{project.name}</h1>
            {role || period ? (
              <p className="mt-4 text-lg text-muted">{[role, period].filter(Boolean).join(" · ")}</p>
            ) : null}
            <p className="mt-6 text-xl text-ink/80">{project.summary}</p>
          </Reveal>
          {project.roles?.length ? (
            <Reveal className="mt-14 max-w-3xl">
              <h2 className="text-sm font-medium uppercase tracking-[0.18em] text-muted">
                My roles at {project.name}
              </h2>
              <ol className="mt-6 border-l border-border">
                {project.roles.map((r) => (
                  <li key={r.title} className="relative pb-8 pl-8 last:pb-0">
                    <span
                      aria-hidden
                      className="absolute -left-[5px] top-2 size-2.5 rounded-full bg-accent"
                    />
                    <div className="flex flex-col gap-1 md:flex-row md:items-baseline md:justify-between md:gap-6">
                      <h3 className="font-display text-xl font-semibold">{r.title}</h3>
                      <p className="shrink-0 text-sm text-muted">{r.period}</p>
                    </div>
                    {r.note ? <p className="mt-2 text-ink/80">{r.note}</p> : null}
                  </li>
                ))}
              </ol>
            </Reveal>
          ) : null}
        </Container>
      </section>

      <section className="pb-24 md:pb-32">
        <Container>
          <h2 className="text-sm font-medium uppercase tracking-[0.18em] text-muted">
            What I worked on
          </h2>
          <Stagger className="mt-6 grid gap-6 md:grid-cols-2">
            {project.sections.map((s) => (
              <StaggerItem key={s.slug}>
                <Link
                  href={`/work/${project.slug}/${s.slug}`}
                  className={`group relative isolate flex h-full min-h-56 flex-col overflow-hidden rounded-card p-8 transition-all hover:-translate-y-1 hover:shadow-xl text-white`}
                >
                  <CardBackdrop image={s.images?.[0]?.src} shade={s.kind} />
                  <div className="flex items-start justify-between gap-4">
                    <Tag tone="light">{KIND_LABEL[s.kind]}</Tag>
                    <ArrowUpRight className={CARD_ICON} />
                  </div>
                  <h3 className="mt-6 text-3xl font-semibold">{s.title}</h3>
                  <p className="mt-3 flex-1">
                    {finalCopy(s.blurb) ?? "This one is still being written."}
                  </p>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </Container>
      </section>

      <ProjectPager slug={project.slug} />
    </>
  );
}
