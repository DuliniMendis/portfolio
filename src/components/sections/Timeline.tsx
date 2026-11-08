import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getProject } from "@/content/projects";

type Entry = { company: string; role: string; period: string; note: string; href?: string };

// Roles and periods for companies with a project page come from projects.ts.
function fromProject(slug: string, note: string): Entry {
  const p = getProject(slug);
  if (!p) throw new Error(`Unknown project: ${slug}`);
  return { company: p.name, role: p.role, period: p.period, note, href: `/work/${slug}` };
}

// From LinkedIn and the CV. Order: most recent first, by start date.
const entries: Entry[] = [
  fromProject("canva", "Cutting AI costs, agent tools and internal tools"),
  fromProject("leonardo-ai", "Flow State, Blueprints and building the team"),
  fromProject("seer-medical", "Data Viewer, live monitoring and clinic tools"),
  {
    company: "Outcome.Life",
    role: "Web Developer (part-time)",
    period: "Mar 2017 – Jun 2017",
    note: "A React and GraphQL product that matched interns with organisations offering internships",
  },
  {
    company: "IBM",
    role: "Research Intern",
    period: "Jun 2016 – Oct 2016",
    note: "Brain-computer interfaces from EEG with deep learning, and reading the political leaning of news articles with NLP",
  },
  {
    company: "University of Melbourne",
    role: "PhD (Engineering), computational neuroscience",
    period: "Jan 2014 – Sep 2017",
    note: "Brain cells grown on microelectrode arrays, with signal processing and machine learning to find patterns in their activity",
  },
  {
    company: "Virtusa",
    role: "Senior Engineer, Technology",
    period: "Dec 2011 – Jul 2013",
    note: "Hybrid and Android apps for a US startup, then a .NET web app for vehicle insurers",
  },
];

export function Timeline() {
  return (
    <section className="border-t border-border bg-surface py-24 md:py-32">
      <Container>
        <SectionHeading eyebrow="Experience" title="Where I&apos;ve worked." />
        <ol className="mt-14 divide-y divide-border border-y border-border">
          {entries.map((e) => (
            <Reveal
              key={e.company}
              as="li"
              className="grid gap-2 py-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] md:gap-10"
            >
              <div>
                {e.href ? (
                  <Link
                    href={e.href}
                    className="font-display text-2xl font-semibold transition-colors hover:text-blue-text"
                  >
                    {e.company}
                  </Link>
                ) : (
                  <span className="font-display text-2xl font-semibold">{e.company}</span>
                )}
                <p className="mt-1 text-ink/80">{e.role}</p>
              </div>
              <div className="md:text-right">
                <p className="text-sm text-muted">{e.period}</p>
                <p className="mt-1 text-muted">{e.note}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </Container>
    </section>
  );
}
