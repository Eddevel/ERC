import Link from "next/link";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Users, MapPin, Heart, Trophy } from "lucide-react";

export const metadata = {
  title: "About | Eko Runner Club",
  description: "Learn about Eko Runner Club (ERC) — Lagos run community.",
};

const values = [
  {
    icon: Users,
    title: "Community",
    text: "We run together across Lagos — beginners to marathoners welcome.",
  },
  {
    icon: MapPin,
    title: "Branches",
    text: "Lekki, Ajah, UNILAG, Ikeja, Yaba, Surulere, VI, Ikorodu and more.",
  },
  {
    icon: Heart,
    title: "Wellness",
    text: "More than pace: recovery, consistency, and supporting each other.",
  },
  {
    icon: Trophy,
    title: "Race ready",
    text: "Group runs and training energy for local races and personal goals.",
  },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <section className="bg-gradient-to-br from-orange-50 to-white dark:from-neutral-950 dark:to-neutral-900 py-16 md:py-24">
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <p className="text-orange-500 font-medium text-sm mb-3">About ERC</p>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Ẹ̀ko Runners Club
            </h1>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
              Ẹ̀ko Runners Club (ERC) is a Lagos-based running community built on
              consistency, friendship, and the roads of our city. From early
              morning jogs to race day, we show up for each other.
            </p>
          </div>
        </section>

        <section className="py-16 container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-10">What we stand for</h2>
          <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {values.map((v) => (
              <div
                key={v.title}
                className="rounded-2xl border bg-card p-6 shadow-sm"
              >
                <div className="h-11 w-11 rounded-xl bg-orange-500/10 flex items-center justify-center mb-4">
                  <v.icon className="h-5 w-5 text-orange-500" />
                </div>
                <h3 className="font-semibold text-lg">{v.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{v.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="py-16 bg-muted/40">
          <div className="container mx-auto px-4 max-w-2xl text-center">
            <h2 className="text-2xl font-bold mb-4">Join the movement</h2>
            <p className="text-muted-foreground mb-8">
              Create an account, pick your branch, and book your next run.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                href="/register"
                className="inline-flex h-11 items-center rounded-lg bg-orange-500 hover:bg-orange-600 text-white px-6 font-medium"
              >
                Join ERC
              </Link>
              <Link
                href="/events"
                className="inline-flex h-11 items-center rounded-lg border px-6 font-medium hover:bg-muted"
              >
                View events
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}