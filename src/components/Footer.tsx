import { Container } from "@/components/ui/Container";

export function Footer() {
  return (
    <footer className="border-t border-border py-8">
      <Container className="flex flex-col gap-2 text-sm text-muted md:flex-row md:justify-between">
        <span>© Dulini Mendis</span>
        <span>Builder and leader.</span>
      </Container>
    </footer>
  );
}
