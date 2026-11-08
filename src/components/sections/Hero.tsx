import { HeroVisual } from "@/components/hero/HeroVisual";
import { StaticFrame } from "@/components/hero/game/StaticFrame";
import { ScrollDrift } from "@/components/hero/ScrollDrift";
import type { CSSProperties } from "react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

// CSS entrance (see .hero-in in globals.css) rather than <Reveal>, so the headline is visible at first paint.
const delay = (seconds: number) => ({ "--hero-delay": `${seconds}s` }) as CSSProperties;

export function Hero() {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden pt-16">
      {/* Faint colour wash behind the game panel, drawn from the portrait palette. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 top-1/2 h-[720px] w-[720px] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(92,198,244,0.08),rgba(255,154,61,0.07)_45%,transparent_70%)]"
      />
      <Container className="relative grid items-center gap-4 md:grid-cols-2 md:gap-12">
        <ScrollDrift rate={-0.08} fade className="order-2 md:order-1">
          <div className="hero-in">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-blue-text">
              Dulini Mendis
            </p>
          </div>
          <div className="hero-in" style={delay(0.08)}>
            <h1 className="mt-4 text-5xl font-semibold leading-[1.05] md:text-7xl">
              I build products and the teams that ship them.
            </h1>
          </div>
          <div className="hero-in" style={delay(0.16)}>
            <p className="mt-6 max-w-lg text-lg text-muted">
              I lead engineering teams and still build things myself. I&apos;ve worked on
              clinical data tools and AI products, and I care about the craft and the
              people doing it.
            </p>
          </div>
          <div className="hero-in mt-10 flex flex-wrap gap-3" style={delay(0.24)}>
            <Button href="/#work">See my work</Button>
            <Button href="/#leadership" variant="ghost">
              How I lead
            </Button>
            <Button href="/dulini-mendis-cv.pdf" variant="ghost" download>
              Download CV
            </Button>
          </div>
        </ScrollDrift>

        <ScrollDrift rate={0.12} className="order-1 h-[22rem] md:order-2 md:h-[600px]">
          <HeroVisual fallback={<StaticFrame />} />
        </ScrollDrift>
      </Container>
    </section>
  );
}
