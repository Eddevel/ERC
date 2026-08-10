"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Users, Zap, Heart, Trophy } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    icon: Users,
    title: "Community First",
    description:
      "Train with hundreds of passionate runners across Lagos every week.",
  },
  {
    icon: Zap,
    title: "All Levels Welcome",
    description:
      "From first-timers to elite athletes — pace groups for everyone.",
  },
  {
    icon: Heart,
    title: "Health & Wellness",
    description:
      "More than mileage. Recovery, consistency, and mindset matter here.",
  },
  {
    icon: Trophy,
    title: "Race Ready",
    description:
      "Group support and energy for local races and personal bests.",
  },
];

export function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const cards = cardsRef.current?.querySelectorAll(".about-card");
    if (!section || !cards?.length) return;

    const ctx = gsap.context(() => {
      gsap.from(cards, {
        y: 40,
        opacity: 0,
        duration: 0.7,
        stagger: 0.12,
        ease: "power3.out",
        clearProps: "all", // leave cards fully visible after animation
        scrollTrigger: {
          trigger: section,
          start: "top 80%", // fire when section enters viewport
          once: true,
        },
      });
    }, section);

    // Safety: if ScrollTrigger never runs, show cards anyway
    const fallback = setTimeout(() => {
      cards.forEach((el) => {
        (el as HTMLElement).style.opacity = "1";
        (el as HTMLElement).style.transform = "none";
      });
    }, 2000);

    return () => {
      clearTimeout(fallback);
      ctx.revert();
    };
  }, []);

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative py-20 md:py-28 bg-background overflow-hidden"
    >
      {/* soft background accent */}
      <div className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full bg-orange-500/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-64 w-64 rounded-full bg-orange-400/5 blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl mx-auto text-center mb-14 md:mb-16">
          <span className="inline-block text-sm font-semibold tracking-wide uppercase text-orange-500 mb-3">
            Why Ẹ̀RC
          </span>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Why{" "}
            <span className="text-orange-500">Ẹ̀ko Runner Club</span>?
          </h2>
          <p className="mt-4 text-muted-foreground text-base md:text-lg leading-relaxed">
            Born in the heart of Lagos, Ẹ̀RC is more than a run club — it&apos;s
            a community that shows up, mile after mile.
          </p>
        </div>

        <div
          ref={cardsRef}
          className="grid gap-5 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {features.map((f) => (
            <div
              key={f.title}
              className="about-card group rounded-2xl border border-border/80 bg-card p-6 shadow-sm hover:shadow-lg hover:border-orange-500/30 transition-all duration-300"
              style={{ opacity: 1 }} // visible even before GSAP
            >
              <div className="h-12 w-12 rounded-xl bg-orange-500/10 flex items-center justify-center mb-4 group-hover:bg-orange-500/20 transition-colors">
                <f.icon className="h-6 w-6 text-orange-500" />
              </div>
              <h3 className="font-semibold text-lg tracking-tight">
                {f.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}