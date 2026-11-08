import Link from "next/link";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { Container } from "@/components/ui/Container";

// Facts from Dulini (Nov 2026), LinkedIn, the CV and the Leonardo.ai case study. Keep them in step.
const stats = [
  { value: "11", label: "reports at Seer, across a product team and two platform teams" },
  { value: "7", label: "backend and ML engineers led at Canva" },
  { value: "4", label: "engineers led at Leonardo.ai" },
  { value: "2", label: "engineers promoted from mid-level to senior" },
];

// Excerpts from LinkedIn recommendations, quoted word for word (cuts marked with an ellipsis).
const quotes = [
  {
    text: "One of her strengths was helping the team turn ambiguous work into clear next steps. … Dulini would [be] an asset to any team looking for an engineering manager who combines technical understanding with practical delivery leadership and care for the people doing the work.",
    name: "Madeline Long",
    role: "Backend Software Engineer, Canva",
  },
  {
    text: "Dulini has been an excellent mentor who has challenged me to become the best version of myself, always in a supportive and constructive manner. … She loves coding so much that she scored the highest in our Hackathon coding challenge.",
    name: "Angie Hentri",
    role: "Software Engineer, Seer Medical",
  },
];

const points = [
  {
    title: "People own the work",
    body: "Every part of a feature has a champion who runs it from kickoff to launch, and keeps looking after it once it's live.",
  },
  {
    title: "Time to switch off",
    body: "At Leonardo, I took a team used to burnout and last-minute fixes and got it shipping high-quality work on time, without the late nights.",
  },
  {
    title: "Room to grow",
    body: "I hired the whole Seer-Clinic team, and promoted two engineers from mid-level to senior, one at Seer and one at Leonardo. I grew the same way, promoted three times at Seer from software engineer to senior engineering manager.",
  },
];

export function Leader() {
  return (
    <section id="leadership" className="relative scroll-mt-20 overflow-hidden bg-ink py-24 text-background md:py-32">
      {/* The one dark section on the page: breaks up the light ones. Soft glows keep the orange and blue palette. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 -top-40 h-[560px] w-[560px] rounded-full bg-[radial-gradient(circle,rgba(26,150,210,0.22),transparent_70%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-48 -right-40 h-[620px] w-[620px] rounded-full bg-[radial-gradient(circle,rgba(255,154,61,0.16),transparent_70%)]"
      />
      <Container className="relative">
        <Reveal className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-blue-light">Leader</p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight md:text-5xl">
            Teams that own their work and still log off on time.
          </h2>
          <p className="mt-4 text-lg text-background/75">
            I&apos;ve led engineering teams at Seer Medical, Leonardo.ai and Canva. Instead of
            handing out tickets, I give each part of the work an owner, and spend my time
            coaching.
          </p>
        </Reveal>

        <Stagger className="mt-12 grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4">
          {stats.map((s) => (
            <StaggerItem key={s.label}>
              <p className="font-display text-5xl font-semibold text-accent">{s.value}</p>
              <p className="mt-2 text-sm text-background/75">{s.label}</p>
            </StaggerItem>
          ))}
        </Stagger>

        <Stagger className="mt-14 grid gap-px overflow-hidden rounded-card bg-background/15 ring-1 ring-background/15 md:grid-cols-3">
          {points.map((p) => (
            <StaggerItem key={p.title} className="bg-ink p-8">
              <h3 className="text-2xl font-semibold">{p.title}</h3>
              <p className="mt-3 text-background/75">{p.body}</p>
            </StaggerItem>
          ))}
        </Stagger>

        <Stagger className="mt-14 grid gap-6 md:grid-cols-2">
          {quotes.map((q) => (
            <StaggerItem key={q.name}>
              <figure className="flex h-full flex-col rounded-card bg-background/[0.06] p-8 ring-1 ring-background/15">
                <blockquote className="flex-1 font-display text-xl leading-snug">
                  <p>&ldquo;{q.text}&rdquo;</p>
                </blockquote>
                <figcaption className="mt-6 text-sm">
                  <span className="font-semibold">{q.name}</span>
                  <span className="text-background/75">, {q.role}. Reported to me directly.</span>
                </figcaption>
              </figure>
            </StaggerItem>
          ))}
        </Stagger>

        <Reveal className="mt-10 flex flex-col gap-3 sm:flex-row sm:gap-8">
          <Link
            href="/work/seer-medical/leading-the-teams"
            className="text-sm font-medium text-background underline underline-offset-4 hover:text-blue-light"
          >
            How I led Seer&apos;s clinic and platform teams →
          </Link>
          <Link
            href="/work/leonardo-ai/building-the-team"
            className="text-sm font-medium text-background underline underline-offset-4 hover:text-blue-light"
          >
            How I built the team at Leonardo.ai →
          </Link>
        </Reveal>
      </Container>
    </section>
  );
}
