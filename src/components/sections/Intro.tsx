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
          <p className="font-display text-3xl font-medium leading-snug md:text-5xl">
            The best work I&apos;ve seen came from teams who were trusted to make their own
            calls, and who still got to log off at a decent hour.
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
