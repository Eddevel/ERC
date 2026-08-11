import Link from "next/link";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/landing/Footer";

export const metadata = {
  title: "Founders & Captains | Ẹ̀ko runners Club",
  description:
    "Meet the founders and run captains of Ẹ̀ko runners Club (ERC) across Lagos.",
};

const founders = [
  {
    name: "Olachukwu Offor (right)",
    role: "Co-Founder",
    bio: "Is an event manager, creative producer and fitness enthusiast, and believer in the power of community and collective empowerment. As Co-founder of the successful Berlin-based collective ROOTS, and with expertise in event management, she brings strategic vision and creativity to Èkó Runners Club, helping it grow into a movement that goes beyond running.",
    image:"/images/ola&tega.jpg"  },
     {
    name: "Oghenetega Akintola (right)",
    role: "Co-Founder",
    bio: "Is a former Lagos State gymnast, psychologist, and creative producer- shaped by years of training, performance, and discipline. As a wellness advocate rooted in movement, she shapes the experience of Èkó Runners Club, combining programming, culture, and storytelling to build a community where movement and connection come first.",

    image:"/images/hero-2.jpg"  },
];

const captains = [
  
  {
    name: "ERC Captains",
    branch: "Ajah, Lekki, ikoyi.",
    role: "Run Captain",
    bio: "Weekday evenings and weekend long runs around Ikoyi. Lekki and Ajah. Strong on community support.",
    image:
      "/images/captains.jpg",
  },
  {
    name: "ERC Captains",
    branch: "Yaba, Surulere, Unilag",
    role: "Run Captain",
    bio: "Tech-hub paces and recovery chats. Holds space for every level in Yaba, Surulere and Unilag.",
    image:
      "/images/captain2.jpg",
  },
 
];

function PersonCard({
  name,
  role,
  bio,
  image,
  branch,
}: {
  name: string;
  role: string;
  bio: string;
  image: string;
  branch?: string;
}) {
  return (
    <article className="rounded-2xl border bg-card overflow-hidden shadow-sm hover:shadow-md transition">
      <div className="aspect-square relative bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-5">
        <h3 className="font-semibold text-lg">{name}</h3>
        <p className="text-sm text-orange-600 font-medium mt-0.5">
          {branch ? `${role} · ${branch}` : role}
        </p>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          {bio}
        </p>
      </div>
    </article>
  );
}

export default function FoundersPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        {/* Hero */}
        <section className="bg-gradient-to-br from-orange-50 via-white to-orange-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 py-16 md:py-20">
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <p className="text-orange-500 font-medium text-sm mb-3">
              Leadership
            </p>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Founders & Run Captains
            </h1>
            <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
              The people who started Ẹ̀RC and the captains who keep each branch
              moving on the road and in the community.
            </p>
          </div>
        </section>

        {/* Founders */}
        <section className="py-16 container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold">
              Meet the <span className="text-orange-500">Founders</span>
            </h2>
            <p className="mt-3 text-muted-foreground">
             Inspired by the global running movement and driven by a shared passion for community,connection, and wellness, Oghenetega Akintola (right) and Olachukwu Offor (left) set out to create a space where Lagos runners could come together. As the only female co-founders of a running club in Nigeria, they wanted to redefine what running culture looks like building a club that is inclusive, empowering, and rooted in consistency, connection, and collective growth.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {founders.map((f) => (
              <PersonCard key={f.name} {...f} />
            ))}
          </div>
        </section>

        {/* Captains */}
        <section className="py-16 bg-muted/40">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold">
                Run <span className="text-orange-500">Captains</span>
              </h2>
              <p className="mt-3 text-muted-foreground">
                Branch captains coordinate meetups, paces, and local routes so
                every runners has a home crew.
              </p>
            </div>

            <div className="grid sm:grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto ">
              {captains.map((c) => (
                <PersonCard  key={c.name + c.branch} {...c} />
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-3">Want to lead a branch?</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            We’re always looking for dedicated captains. Join Ẹ̀RC and reach out
            to the team.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/register"
              className="inline-flex h-11 items-center rounded-lg bg-orange-500 hover:bg-orange-600 text-white px-6 font-medium"
            >
              Join Ẹ̀RC
            </Link>
            <Link
              href="/about"
              className="inline-flex h-11 items-center rounded-lg border px-6 font-medium hover:bg-muted"
            >
              About the club
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}