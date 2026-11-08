import { Reveal } from "@/components/motion/Reveal";
import { Container } from "@/components/ui/Container";

export function Intro() {
  return (
    <section id="about" className="scroll-mt-20 border-y border-border bg-surface py-24 md:py-32">
      <Container>
        <Reveal className="max-w-4xl">
          <p className="font-display text-3xl font-medium leading-snug md:text-5xl">
            Great products come from teams that are trusted to think, rested enough to
            care, and close enough to the problem to build the right thing.
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
