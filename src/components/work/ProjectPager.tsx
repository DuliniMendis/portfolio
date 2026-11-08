import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { neighbours } from "@/content/projects";

/** Previous and next project, wrapping around, shown at the foot of a project page. */
export function ProjectPager({ slug }: { slug: string }) {
  const { prev, next } = neighbours(slug);
  return (
    <nav aria-label="Other projects" className="border-t border-border bg-surface">
      <Container className="grid gap-px md:grid-cols-2">
        <Link
          href={`/work/${prev.slug}`}
          className="group flex flex-col gap-2 py-10 transition-colors md:pr-10"
        >
          <span className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted">
            <ArrowLeft size={14} /> Previous
          </span>
          <span className="font-display text-3xl font-semibold group-hover:text-blue-text">{prev.name}</span>
        </Link>
        <Link
          href={`/work/${next.slug}`}
          className="group flex flex-col gap-2 py-10 md:items-end md:border-l md:border-border md:pl-10"
        >
          <span className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted">
            Next <ArrowRight size={14} />
          </span>
          <span className="font-display text-3xl font-semibold group-hover:text-blue-text">{next.name}</span>
        </Link>
      </Container>
    </nav>
  );
}
