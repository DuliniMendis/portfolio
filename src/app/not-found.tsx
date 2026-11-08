import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { NotFoundContent } from "@/components/NotFoundContent";

export default function NotFound() {
  return (
    <>
      <Nav />
      <main id="main" className="flex-1 pt-16">
        <NotFoundContent />
      </main>
      <Footer />
    </>
  );
}
