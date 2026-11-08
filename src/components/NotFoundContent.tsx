import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export function NotFoundContent() {
  return (
    <section className="flex min-h-[70vh] items-center py-24">
      <Container>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">404</p>
        <h1 className="mt-3 text-5xl font-semibold leading-tight md:text-7xl">
          That page isn&apos;t here.
        </h1>
        <p className="mt-6 max-w-lg text-lg text-muted">
          The link might be mistyped, or the page might have moved. The home page is a good
          place to start.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Button href="/">Back to home</Button>
          <Button href="/#work" variant="ghost">
            See my work
          </Button>
        </div>
      </Container>
    </section>
  );
}
