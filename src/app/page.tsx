import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { Builder } from "@/components/sections/Builder";
import { Contact } from "@/components/sections/Contact";
import { Hero } from "@/components/sections/Hero";
import { Intro } from "@/components/sections/Intro";
import { Leader } from "@/components/sections/Leader";
import { Timeline } from "@/components/sections/Timeline";
import { Work } from "@/components/sections/Work";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Intro />
        <Builder />
        <Leader />
        <Work />
        <Timeline />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
