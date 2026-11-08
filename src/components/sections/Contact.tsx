import { Reveal } from "@/components/motion/Reveal";
import { Container } from "@/components/ui/Container";

const LINKEDIN = "https://www.linkedin.com/in/dulini-mendis-537aa11b/";

export function Contact() {
  return (
    <section id="contact" className="scroll-mt-20 py-24 md:py-40">
      <Container>
        <Reveal className="max-w-3xl">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-blue">Contact</p>
          <h2 className="mt-3 text-5xl font-semibold leading-tight md:text-7xl">
            Let&apos;s build something good.
          </h2>
          <a
            href={LINKEDIN}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-10 inline-flex rounded-full bg-accent px-8 py-4 text-lg font-medium text-ink transition-colors hover:bg-blue hover:text-white"
          >
            Connect on LinkedIn
          </a>
        </Reveal>
      </Container>
    </section>
  );
}
