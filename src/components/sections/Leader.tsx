import Link from "next/link";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { Container } from "@/components/ui/Container";

// Plain-language summary of the Leonardo.ai case study. Keep it in step with that page.
const points = [
  {
    title: "People own the work",
    body: "Every part of a feature has a champion who runs it from kickoff to launch, and keeps looking after it once it's live.",
  },
  {
    title: "Time to switch off",
    body: "Rested people make better calls. I don't see doing great work and having a life outside it as a trade-off.",
  },
  {
    title: "Room to grow",
    body: "Coaching, honest feedback and real responsibility. One of my mid-level engineers had grown into a senior by the time I left.",
  },
];

export function Leader() {
  return (
    <section id="leadership" className="scroll-mt-20 bg-gradient-to-br from-sky to-peach py-24 text-ink md:py-32">
      <Container>
        <Reveal className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-blue-text">Leader</p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight md:text-5xl">
            Teams that own their work and still log off on time.
          </h2>
          <p className="mt-4 text-lg text-ink/70">
            At Leonardo.ai I led four engineers. Instead of handing out tickets, I gave each
            part of a feature an owner, and spent my time coaching.
          </p>
        </Reveal>

        <Stagger className="mt-14 grid gap-px overflow-hidden rounded-card bg-ink/10 md:grid-cols-3">
          {points.map((p) => (
            <StaggerItem key={p.title} className="bg-white/70 p-8 backdrop-blur">
              <h3 className="text-2xl font-semibold">{p.title}</h3>
              <p className="mt-3 text-ink/70">{p.body}</p>
            </StaggerItem>
          ))}
        </Stagger>

        <Reveal className="mt-10">
          <Link
            href="/work/leonardo-ai/building-the-team"
            className="text-sm font-medium text-ink underline underline-offset-4 hover:text-blue-text"
          >
            Read how I built the team →
          </Link>
        </Reveal>
      </Container>
    </section>
  );
}
