import { Navbar } from "@/components/shared/Navbar";
import { Hero } from "@/components/landing/Hero";
import { About } from "@/components/landing/About";
import { UpcomingEvents } from "@/components/landing/UpcomingEvents";
import { Footer } from "@/components/landing/Footer";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <About />
        <UpcomingEvents />
      </main>
      <Footer />
    </>
  );
}