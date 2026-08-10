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
    name: "Olachukwu and Oghenetega",
    role: "Co-Founder",
    bio: "Started Ẹ̀RC to build a consistent, welcoming run culture across Lagos. Believes every runners has a place in the pack. Passionate about community fitness and safe group runs. Leads the vision for branches and member experience.",
    image:"/images/hero-2.jpg"  },
];

const captains = [
  {
    name: "Tunde Bakare",
    branch: "Lekki",
    role: "Run Captain",
    bio: "Saturday long runs and coastal routes. Keeps the Lekki crew steady and smiling.",
    image:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
  },
  {
    name: "Funke Adeyemi",
    branch: "Ajah",
    role: "Run Captain",
    bio: "Early birds and beginner-friendly paces. Building Ajah one easy run at a time.",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
  },
  {
    name: "Ibrahim Yusuf",
    branch: "UNILAG",
    role: "Run Captain",
    bio: "Campus loops and student energy. Coordinates UNILAG meetups and race prep.",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face",
  },
  {
    name: "Ngozi Okafor",
    branch: "Ikeja",
    role: "Run Captain",
    bio: "Weekday evenings and weekend long runs around Ikeja. Strong on community support.",
    image:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face",
  },
  {
    name: "Emeka Nwosu",
    branch: "Yaba",
    role: "Run Captain",
    bio: "Tech-hub paces and recovery chats. Holds space for every level in Yaba.",
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face",
  },
  {
    name: "Aisha Bello",
    branch: "Surulere",
    role: "Run Captain",
    bio: "Neighborhood routes and inclusive packs. Surulere’s go-to for midweek motivation.",
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face",
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
              About the <span className="text-orange-500">Founders</span>
            </h2>
            <p className="mt-3 text-muted-foreground">
              Ẹ̀RC began with a simple idea: Lagos deserves a run club that feels
              like family — structured enough to grow, open enough for everyone.
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

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto hidden">
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