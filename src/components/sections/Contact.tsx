import { ContactForm } from "@/components/ContactForm";
import { Reveal } from "@/components/motion/Reveal";
import { Container } from "@/components/ui/Container";

const LINKEDIN = "https://www.linkedin.com/in/dulini-mendis-537aa11b/";

export function Contact() {
  return (
    <section id="contact" className="scroll-mt-20 py-24 md:py-40">
      <Container className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-16">
        <Reveal>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-blue-text">Contact</p>
          <h2 className="mt-3 text-5xl font-semibold leading-tight md:text-7xl">
            Let&apos;s build something good.
          </h2>
          <p className="mt-6 text-lg text-muted md:text-xl">
            Based in Melbourne, Australia. Open to engineering and leadership roles.
          </p>
          <p className="mt-6 text-lg text-muted">
            Send me a message here, or{" "}
            <a
              href={LINKEDIN}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-ink underline underline-offset-4 hover:text-blue-text"
            >
              connect on LinkedIn
            </a>
            .
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <ContactForm />
        </Reveal>
      </Container>
    </section>
  );
}
