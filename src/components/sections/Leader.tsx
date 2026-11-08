import Link from "next/link";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { Container } from "@/components/ui/Container";

// Draft copy: confirm and add real outcomes with the owner (see CONTENT.md).
const points = [
  {
    title: "Empowered",
    body: "Clear goals, real ownership. Teams decide how, and leaders clear the path.",
  },
  {
    title: "Sustainable",
    body: "High performance and work-life balance are not a trade-off. Rested teams ship better.",
  },
  {
    title: "Growing",
    body: "Hiring, coaching and feedback that leave people more capable than they arrived.",
  },
];

export function Leader() {
  return (
    <section id="leadership" className="scroll-mt-20 bg-gradient-to-br from-sky to-peach py-24 text-ink md:py-32">
      <Container>
        <Reveal className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-blue">Leader</p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight md:text-5xl">
            Teams that are empowered, high performing, and well rested.
          </h2>
          <p className="mt-4 text-lg text-ink/70">
            At Leonardo.ai I built a team culture where people own the outcome and still log
            off on time.
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
            className="text-sm font-medium text-ink underline underline-offset-4 hover:text-blue"
          >
            Read how I built the team →
          </Link>
        </Reveal>
      </Container>
    </section>
  );
}
