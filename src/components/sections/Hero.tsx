import { HeroVisual } from "@/components/hero/HeroVisual";
import { ScrollDrift } from "@/components/hero/ScrollDrift";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export function Hero() {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden pt-16">
      {/* Soft colour wash behind the model, drawn from the portrait palette. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 top-1/2 h-[720px] w-[720px] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(92,198,244,0.22),rgba(255,154,61,0.20)_45%,transparent_70%)]"
      />
      <Container className="relative grid items-center gap-4 md:grid-cols-2 md:gap-12">
        <ScrollDrift rate={-0.08} fade className="order-2 md:order-1">
          <Reveal>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-blue-text">
              Dulini Mendis
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="mt-4 text-5xl font-semibold leading-[1.05] md:text-7xl">
              I build products and the teams that ship them.
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mt-6 max-w-lg text-lg text-muted">
              I lead engineering teams and still build things myself. I&apos;ve worked on
              clinical data tools and AI products, and I care about the craft and the
              people doing it.
            </p>
          </Reveal>
          <Reveal delay={0.24} className="mt-10 flex flex-wrap gap-3">
            <Button href="/#work">See my work</Button>
            <Button href="/#leadership" variant="ghost">
              How I lead
            </Button>
          </Reveal>
        </ScrollDrift>

        <ScrollDrift rate={0.12} className="order-1 h-[22rem] md:order-2 md:h-[600px]">
          <HeroVisual />
        </ScrollDrift>
      </Container>
    </section>
  );
}
