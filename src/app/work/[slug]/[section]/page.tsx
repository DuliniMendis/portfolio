import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/motion/Reveal";
import { Container } from "@/components/ui/Container";
import { Tag } from "@/components/ui/Tag";
import { BackLink } from "@/components/work/BackLink";
import { KIND_LABEL, finalCopy, getProject, getSection, projects } from "@/content/projects";

export function generateStaticParams() {
  return projects.flatMap((p) => p.sections.map((s) => ({ slug: p.slug, section: s.slug })));
}

export async function generateMetadata({
  params,
}: PageProps<"/work/[slug]/[section]">): Promise<Metadata> {
  const { slug, section } = await params;
  const project = getProject(slug);
  const sec = project && getSection(project, section);
  return project && sec
    ? { title: `${sec.title} · ${project.name} — Dulini Mendis`, description: finalCopy(sec.blurb) }
    : {};
}

// Body headings for every section page. The write-ups themselves come later (see CONTENT.md).
const BODY = ["Context", "What I did", "Outcome"];

export default async function SectionPage({ params }: PageProps<"/work/[slug]/[section]">) {
  const { slug, section } = await params;
  const project = getProject(slug);
  const sec = project && getSection(project, section);
  if (!project || !sec) notFound();

  const others = project.sections.filter((s) => s.slug !== sec.slug);

  return (
    <>
      <section className="py-16 md:py-24">
        <Container>
          <BackLink href={`/work/${project.slug}`}>{project.name}</BackLink>
          <Reveal className="mt-10 max-w-3xl">
            <Tag>{KIND_LABEL[sec.kind]}</Tag>
            <h1 className="mt-5 text-5xl font-semibold leading-tight md:text-7xl">{sec.title}</h1>
            <p className="mt-6 text-xl text-ink/80">
              {finalCopy(sec.blurb) ?? `A closer look at my work on ${sec.title} at ${project.name}.`}
            </p>
          </Reveal>
        </Container>
      </section>

      <section className="border-t border-border bg-surface py-16 md:py-24">
        <Container className="grid gap-12 md:grid-cols-[1fr_2fr]">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted">The story</p>
          <div className="space-y-12">
            {BODY.map((heading) => (
              <div key={heading}>
                <h2 className="text-3xl font-semibold">{heading}</h2>
                {/* TODO(dulini): write this section. Replace the placeholder with the case-study copy. */}
                <p className="mt-3 text-muted">This write-up is in progress.</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {others.length > 0 ? (
        <section className="py-16 md:py-24">
          <Container>
            <h2 className="text-sm font-medium uppercase tracking-[0.18em] text-muted">
              More from {project.name}
            </h2>
            <ul className="mt-6 divide-y divide-border border-y border-border">
              {others.map((s) => (
                <li key={s.slug}>
                  <Link
                    href={`/work/${project.slug}/${s.slug}`}
                    className="flex items-baseline justify-between gap-4 py-5 transition-colors hover:text-blue-text"
                  >
                    <span className="font-display text-2xl font-semibold">{s.title}</span>
                    <span className="text-sm text-muted">{KIND_LABEL[s.kind]}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      ) : null}
    </>
  );
}
