import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
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
  return project ? { title: `${project.name} — Dulini Mendis`, description: project.summary } : {};
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
        </Container>
      </section>

      <section className="pb-24 md:pb-32">
        <Container>
          <h2 className="text-sm font-medium uppercase tracking-[0.18em] text-muted">
            In this project
          </h2>
          <Stagger className="mt-6 grid gap-6 md:grid-cols-2">
            {project.sections.map((s) => (
              <StaggerItem key={s.slug}>
                <Link
                  href={`/work/${project.slug}/${s.slug}`}
                  className="group flex h-full min-h-56 flex-col rounded-card border border-border bg-surface p-8 transition-all hover:-translate-y-1 hover:border-ink hover:shadow-lg"
                >
                  <div className="flex items-start justify-between gap-4">
                    <Tag>{KIND_LABEL[s.kind]}</Tag>
                    <ArrowUpRight className="text-muted transition-colors group-hover:text-blue" />
                  </div>
                  <h3 className="mt-6 text-3xl font-semibold">{s.title}</h3>
                  <p className="mt-3 flex-1 text-muted">
                    {finalCopy(s.blurb) ?? "Write-up coming soon."}
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
