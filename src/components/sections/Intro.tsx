import Image from "next/image";
import { Reveal } from "@/components/motion/Reveal";
import { Container } from "@/components/ui/Container";

export function Intro() {
  return (
    <section id="about" className="scroll-mt-20 border-y border-border bg-surface py-24 md:py-32">
      <Container className="grid items-center gap-12 md:grid-cols-[auto_1fr] md:gap-16">
        <Reveal className="mx-auto md:mx-0">
          {/* Source image is 200x200: keep the rendered size at or below 200px to stay sharp. */}
          <Image
            src="/images/dulini.jpeg"
            alt="Portrait of Dulini Mendis"
            width={200}
            height={200}
            priority
            className="h-[200px] w-[200px] rounded-card object-cover shadow-[0_24px_60px_-20px_rgba(92,198,244,0.5)] ring-1 ring-border"
          />
        </Reveal>
        <Reveal delay={0.1} className="max-w-4xl">
          {/* The TL;DR from Dulini's CV. */}
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-blue-text">TL;DR</p>
          <p className="mt-4 font-display text-2xl font-medium leading-snug md:text-4xl">
            Over the years I&apos;ve gone from being a founding software engineer at Seer
            Medical, a regulated medtech company that ran on software I built or led, to tech
            lead at Leonardo.Ai and now Engineering Manager for Canva&apos;s Design Generation
            Platform, which supports the LLM pipelines behind Canva AI.
          </p>
          <p className="mt-6 text-lg text-ink/80 md:text-xl">
            Solving problems that truly make a difference, supporting the growth of others and
            getting things into the hands of users is what motivates me the most.
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
