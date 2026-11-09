import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/motion/Reveal";
import { Container } from "@/components/ui/Container";
import { Tag } from "@/components/ui/Tag";
import { BackLink } from "@/components/work/BackLink";
import { BODY_PARTS, KIND_TAGS, finalCopy, getProject, getSection, isDraft, projects } from "@/content/projects";

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
    ? { title: `${sec.title} · ${project.name} · Dulini Mendis`, description: finalCopy(sec.blurb) }
    : {};
}

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
            <div className="flex flex-wrap gap-2">
              {KIND_TAGS[sec.kind].map((t) => (
                <Tag key={t}>{t}</Tag>
              ))}
            </div>
            <h1 className="mt-5 text-5xl font-semibold leading-tight md:text-7xl">{sec.title}</h1>
            <p className="mt-6 text-xl text-ink/80">
              {finalCopy(sec.blurb) ?? `My work on ${sec.title} at ${project.name}.`}
            </p>
            {sec.stack?.length ? (
              <div className="mt-8">
                <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-muted">Built with</h2>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {sec.stack.map((t) => (
                    <li key={t}>
                      <Tag>{t}</Tag>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </Reveal>
        </Container>
      </section>

      {sec.images?.length ? (
        <section className="pb-16 md:pb-24">
          <Container className="space-y-12">
            {sec.images.map((img, i) => (
              <Reveal key={img.src.src}>
                <figure>
                  <Image
                    src={img.src}
                    alt={img.alt}
                    placeholder="blur"
                    sizes="(min-width: 1200px) 1120px, 100vw"
                    preload={i === 0}
                    className="h-auto w-full rounded-card border border-border shadow-lg"
                  />
                  {img.caption ? (
                    <figcaption className="mt-4 text-sm text-muted">{img.caption}</figcaption>
                  ) : null}
                </figure>
              </Reveal>
            ))}
          </Container>
        </section>
      ) : null}

      <section className="border-t border-border bg-surface py-16 md:py-24">
        <Container className="grid gap-12 md:grid-cols-[1fr_2fr]">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted">The story</p>
          <div className="space-y-12">
            {BODY_PARTS.map(({ key, heading }) => {
              const paragraphs = sec.body?.[key]?.filter((p) => !isDraft(p));
              return (
                <div key={key}>
                  <h2 className="text-3xl font-semibold">{heading}</h2>
                  {paragraphs?.length ? (
                    <div className="mt-4 max-w-prose space-y-4 text-lg leading-relaxed text-ink/80">
                      {paragraphs.map((p) => (
                        <p key={p}>{p}</p>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 text-muted">This part is still being written.</p>
                  )}
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {sec.press?.length ? (
        <section className="py-16 md:py-24">
          <Container>
            <h2 className="text-sm font-medium uppercase tracking-[0.18em] text-muted">In the press</h2>
            <ul className="mt-6 divide-y divide-border border-y border-border">
              {sec.press.map((a) => (
                <li key={a.href}>
                  <a
                    href={a.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col gap-2 py-5 transition-colors hover:text-blue-text md:flex-row md:items-baseline md:justify-between md:gap-8"
                  >
                    <span className="flex items-baseline gap-2 text-xl font-semibold">
                      {a.title}
                      <ArrowUpRight
                        size={18}
                        aria-hidden
                        className="shrink-0 self-center transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      />
                    </span>
                    <span className="shrink-0 text-sm text-muted">
                      {a.publisher} · {a.date}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      ) : null}

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
                    <span className="text-sm text-muted">{KIND_TAGS[s.kind].join(" and ")}</span>
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
