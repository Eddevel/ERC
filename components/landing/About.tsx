"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Users, Zap, Heart, Trophy, Target, Eye } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    icon: Users,
    title: "Community First",
    description:
      "Train with passionate runners across Lagos every week friends, family, and the pack.",
  },
  {
    icon: Zap,
    title: "All Levels Welcome",
    description:
      "From first-timers to elite athletes pace groups for everyone.",
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
        clearProps: "all",
        scrollTrigger: {
          trigger: section,
          start: "top 80%",
          once: true,
        },
      });
    }, section);

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
      <div className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full bg-orange-500/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-64 w-64 rounded-full bg-orange-400/5 blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Who we are */}
        <div className="max-w-3xl mx-auto text-center mb-14 md:mb-16">
          <span className="inline-block text-sm font-semibold tracking-wide uppercase text-orange-500 mb-3">
            Who we are
          </span>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            More than a club a{" "}
            <span className="text-orange-500">Lagos movement</span>
          </h2>
          <p className="mt-5 text-muted-foreground text-base md:text-lg leading-relaxed">
            <span className="text-foreground font-medium">
              Ẹ̀ko Runners Club (Ẹ̀RC)
            </span>{" "}
            is friends, family, and a community built on consistency. Founded in
            July 2024 in Lagos, ERC grew from a simple belief: We achieve more
            together and fitness should feel welcoming, not exclusive.
          </p>
          <p className="mt-4 text-muted-foreground text-base md:text-lg leading-relaxed">
            By uniting runners of all levels, ERC is redefining fitness culture
            in the city: a space to run, connect, and thrive.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto mb-16 md:mb-20">
          <div className="rounded-2xl border border-border/80 bg-card p-6 md:p-8 shadow-sm hover:border-orange-500/25 transition-colors">
            <div className="h-11 w-11 rounded-xl bg-orange-500/10 flex items-center justify-center mb-4">
              <Target className="h-5 w-5 text-orange-500" />
            </div>
            <h3 className="text-lg font-bold tracking-tight text-orange-500 uppercase">
              Mission
            </h3>
            <p className="mt-3 text-sm md:text-base text-muted-foreground leading-relaxed">
              To build Nigeria&apos;s leading running community  inclusive,
              empowering, and connected growing across Lagos and beyond while
              earning recognition in the wider running world.
            </p>
          </div>

          <div className="rounded-2xl border border-border/80 bg-card p-6 md:p-8 shadow-sm hover:border-orange-500/25 transition-colors">
            <div className="h-11 w-11 rounded-xl bg-orange-500/10 flex items-center justify-center mb-4">
              <Eye className="h-5 w-5 text-orange-500" />
            </div>
            <h3 className="text-lg font-bold tracking-tight text-orange-500 uppercase">
              Vision
            </h3>
            <p className="mt-3 text-sm md:text-base text-muted-foreground leading-relaxed">
              To redefine running and wellness culture in Lagos and beyond 
              creating a connected, inclusive community where everyone can move,
              grow, and belong.
            </p>
          </div>
        </div>

        {/* Feature cards */}
        <div
          ref={cardsRef}
          className="grid gap-5 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4  max-w-4xl mx-auto"
        >
          {features.map((f) => (
            <div
              key={f.title}
              className="about-card group rounded-2xl border border-border/80 bg-card p-6 shadow-sm hover:shadow-lg hover:border-orange-500/30 transition-all duration-300"
              style={{ opacity: 1 }}
            >
              <div className="h-12 w-12 rounded-xl bg-orange-500/10 flex items-center justify-center mb-4 group-hover:bg-orange-500/20 transition-colors">
                <f.icon className="h-6 w-6 text-orange-500" />
              </div>
              <h3 className="font-semibold text-lg tracking-tight">{f.title}</h3>
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