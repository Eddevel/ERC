"use client";

import Image from "next/image";

const brands = [
  { name: "Oraimo", logo: "/brands/oriamo.png" },
  { name: "Adidas", logo: "/brands/adidas.jpg" },
  { name: "El Padrino", logo: "/brands/elpadrino.jpg" },
  { name: "Puma", logo: "/brands/puma.png" },
  { name: "Pocari Sweat", logo: "/brands/pocari.png" },
  { name: "Filmhouse", logo: "/brands/filmhouse.png" },
  { name: "Foodcourt", logo: "/brands/foodcourt.jpg" },
  { name: "Krispy Kreme", logo: "/brands/krispy.png" },
  { name: "Lagos City Marathon", logo: "/brands/lcm.jpg" },
];

export function Brands() {
  const row = [...brands, ...brands];

  return (
    <section className="py-16 md:py-20 bg-background border-y border-border/60 overflow-hidden">
      <div className="container mx-auto px-4 mb-10 text-center">
        <span className="inline-block text-sm font-semibold tracking-wide uppercase text-orange-500 mb-2">
          Partners
        </span>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
          Brands we&apos;ve <span className="text-orange-500">run with</span>
        </h2>
        <p className="mt-2 text-sm md:text-base text-muted-foreground max-w-lg mx-auto">
          Proud to share the road with partners who support the ERC community.
        </p>
      </div>

      <div className="relative">
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 md:w-24 z-10 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 md:w-24 z-10 bg-gradient-to-l from-background to-transparent" />

        <div className="flex overflow-hidden">
          <div className="flex shrink-0 gap-10 md:gap-16 animate-marquee items-center py-4">
            {row.map((brand, i) => (
              <div
                key={`${brand.name}-${i}`}
                className="relative flex items-center justify-center h-19 w-auto transition duration-300"
                title={brand.name}
              >
                <Image
                  src={brand.logo}
                  alt={brand.name}
                  width={160}
                  height={48}
                  className="object-contain max-h-10 md:max-h-12 w-auto h-auto"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}