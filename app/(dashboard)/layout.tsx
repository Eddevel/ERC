"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Navbar } from "@/components/shared/Navbar";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import Link from "next/link";
import {
  LayoutDashboard,
  Calendar,
  User,
  ScanLine,
  Ticket,
  Settings,
  PieChart,
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAdmin, canScan, canManageEvents, profile, user, loading } =
    useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) return null;

  const links = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/tickets", label: "My Tickets", icon: Ticket },
    { href: "/my-runs", label: "My Runs", icon: Calendar },
    { href: "/profile", label: "Profile", icon: User },
  ];

  // Admin only
  const adminLinks = [
    { href: "/admin/events", label: "Manage Events", icon: Settings },
    { href: "/admin/stats", label: "Stats", icon: PieChart },
  ];

  // Admin + Agent
  const scanLink = {
    href: "/admin/scan",
    label: "Scan Tickets",
    icon: ScanLine,
  };

  const isActive = (href: string) =>
    pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  const itemClass = (href: string) =>
    `flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition whitespace-nowrap ${
      isActive(href)
        ? "bg-orange-500 text-white shadow-sm"
        : "text-muted-foreground hover:bg-orange-500/10 hover:text-orange-600"
    }`;

  const role = profile?.role;

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar />

      <div className="container mx-auto px-4 py-4 sm:py-6 md:py-8">
        <div className="mb-4 sm:mb-6">
          <p className="text-sm text-muted-foreground">Welcome back</p>
          <h1 className="text-lg sm:text-xl font-semibold truncate">
            {profile?.name || user.displayName || "Runner"}
            {role === "admin" && (
              <span className="ml-2 inline-flex items-center rounded-full bg-orange-500/10 px-2 py-0.5 text-xs font-medium text-orange-600">
                Admin
              </span>
            )}
            {role === "agent" && (
              <span className="ml-2 inline-flex items-center rounded-full bg-sky-500/10 px-2 py-0.5 text-xs font-medium text-sky-600">
                Agent
              </span>
            )}
          </h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
          {/* Mobile nav */}
          <nav className="lg:hidden -mx-4 px-4">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
              {links.map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href} className={itemClass(href)}>
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </Link>
              ))}

              {canScan && (
                <Link
                  href={scanLink.href}
                  className={itemClass(scanLink.href)}
                >
                  <scanLink.icon className="h-4 w-4 shrink-0" />
                  {scanLink.label}
                </Link>
              )}

              {isAdmin &&
                adminLinks.map(({ href, label, icon: Icon }) => (
                  <Link key={href} href={href} className={itemClass(href)}>
                    <Icon className="h-4 w-4 shrink-0" />
                    {label}
                  </Link>
                ))}
            </div>
          </nav>

          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-56 shrink-0">
            <nav className="sticky top-24 space-y-1 rounded-2xl border bg-card p-3 shadow-sm">
              <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Menu
              </p>
              {links.map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href} className={itemClass(href)}>
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </Link>
              ))}

              {/* Agent + Admin: scan only section */}
              {canScan && (
                <>
                  <div className="my-2 border-t border-border/60" />
                  <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {isAdmin ? "Admin" : "Agent"}
                  </p>
                  <Link
                    href={scanLink.href}
                    className={itemClass(scanLink.href)}
                  >
                    <scanLink.icon className="h-4 w-4 shrink-0" />
                    {scanLink.label}
                  </Link>
                </>
              )}

              {/* Admin only: events + stats */}
              {isAdmin &&
                adminLinks.map(({ href, label, icon: Icon }) => (
                  <Link key={href} href={href} className={itemClass(href)}>
                    <Icon className="h-4 w-4 shrink-0" />
                    {label}
                  </Link>
                ))}
            </nav>
          </aside>

          <main className="flex-1 min-w-0">
            <div className="rounded-2xl border bg-card p-4 sm:p-6 shadow-sm">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}