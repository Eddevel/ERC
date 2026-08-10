"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";

const SLIDES = [
  {
    src: "/images/hero-2.jpg",
    alt: "global running day",
  },
  {
    src: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=1920&q=80",
    alt: "Runners on the road",
  },
  {
    src: "/images/hero-1.jpg",
    alt: "wellness ladies",
  },
  {
    src: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=1920&q=80",
    alt: "Group running",
  },
  {
    src: "/images/hero-3.jpg",
    alt: "ERC international women day",
  },
];

const SLIDE_INTERVAL_MS = 5000;

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);

  // Background slideshow
  useEffect(() => {
    const id = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  // GSAP text animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.from(titleRef.current, {
        y: 80,
        opacity: 0,
        duration: 1,
      })
        .from(
          subtitleRef.current,
          { y: 40, opacity: 0, duration: 0.8 },
          "-=0.6"
        )
        .from(ctaRef.current, { y: 30, opacity: 0, duration: 0.6 }, "-=0.4");
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative min-h-[90vh] flex items-center overflow-hidden"
    >
      {/* Background slides */}
      <div className="absolute inset-0">
        {SLIDES.map((slide, index) => (
          <div
            key={slide.src}
            className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
            style={{ opacity: index === current ? 1 : 0 }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={slide.src}
              alt={slide.alt}
              className="h-full w-full object-cover"
            />
          </div>
        ))}
        {/* Dark overlay for text contrast */}
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
      </div>

      {/* Slide dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {SLIDES.map((_, index) => (
          <button
            key={index}
            type="button"
            aria-label={`Go to slide ${index + 1}`}
            onClick={() => setCurrent(index)}
            className={`h-2 rounded-full transition-all ${
              index === current
                ? "w-8 bg-orange-500"
                : "w-2 bg-white/50 hover:bg-white/80"
            }`}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-1.5 text-sm font-medium text-white mb-6">
            <MapPin className="h-4 w-4 text-orange-400" />
            Lagos, Nigeria
          </div>

          <h1
            ref={titleRef}
            className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] text-white"
          >
            Run with{" "}
            <span className="text-orange-500">Ẹ̀ko</span>
            <br />
            runners Club
          </h1>

          <p
            ref={subtitleRef}
            className="mt-6 text-lg md:text-xl text-white/85 max-w-xl"
          >
            Join the most vibrant running community in Lagos. Train together,
            race together, grow together. From 5K beginners to marathoners —
            there&apos;s a place for every runner at Ẹ̀RC.
          </p>

          <div ref={ctaRef} className="mt-10 flex flex-wrap gap-4">
            <Link href="/register">
              <Button
                size="lg"
                className="bg-orange-500 hover:bg-orange-600 text-white h-12 px-8 text-base"
              >
                Join the Club
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/events">
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-8 text-base border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white"
              >
                Upcoming Events
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}