import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";

export default function WorkLayout({ children }: LayoutProps<"/work">) {
  return (
    <>
      <Nav />
      <main className="flex-1 pt-16">{children}</main>
      <Footer />
    </>
  );
}
