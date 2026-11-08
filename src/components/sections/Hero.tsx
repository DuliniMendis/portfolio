import { Parallax } from "@/components/motion/Parallax";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

/** Phase 1 hero. The orb is a stand-in that Phase 2 replaces with the 3D scene. */
export function Hero() {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden pt-16">
      <Container className="grid items-center gap-12 md:grid-cols-2">
        <div>
          <Reveal>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent">
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
              Engineering leader who still builds. From clinical data tools to generative
              AI products, I care about craft, and about the people doing the work.
            </p>
          </Reveal>
          <Reveal delay={0.24} className="mt-10 flex flex-wrap gap-3">
            <Button href="/#work">See my work</Button>
            <Button href="/#leadership" variant="ghost">
              How I lead
            </Button>
          </Reveal>
        </div>

        <Parallax distance={50} className="relative flex h-80 items-center justify-center md:h-[520px]">
          <div
            aria-hidden
            className="h-64 w-64 rounded-full bg-gradient-to-br from-accent via-orange-200 to-white shadow-[0_40px_120px_-20px_rgba(242,96,63,0.5)] md:h-96 md:w-96"
          />
        </Parallax>
      </Container>
    </section>
  );
}
