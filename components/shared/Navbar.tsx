"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { logout } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { useRouter, usePathname } from "next/navigation";
import { Menu, X, LogOut, LayoutDashboard, Ticket } from "lucide-react";
import { useEffect, useState } from "react";

const navLinks = [
  { href: "/about", label: "About" },
  { href: "/events", label: "Events" },
  { href: "/founders", label: "Founders" },
];

export function Navbar() {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open || logoutOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open, logoutOpen]);

  const confirmLogout = async () => {
    setLogoutOpen(false);
    setOpen(false);
    await logout();
    router.push("/");
  };

  const linkClass = (href: string) =>
    `text-sm font-medium transition-colors hover:text-orange-500 ${
      pathname === href ? "text-orange-500" : "text-foreground/80"
    }`;

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/90 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="relative z-50 flex items-center shrink-0">
            <Image
              src="/images/logo.png"
              alt="Ẹ̀ko Runner Club"
              width={110}
              height={44}
              className="h-auto w-auto "
              priority
            />
          </Link>

          <nav className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className={linkClass(link.href)}>
                {link.label}
              </Link>
            ))}

            {user ? (
              <>
                <Link href="/dashboard" className={linkClass("/dashboard")}>
                  Dashboard
                </Link>
                <Link href="/tickets" className={linkClass("/tickets")}>
                  My Tickets
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLogoutOpen(true)}
                  className="text-muted-foreground hover:text-orange-600"
                >
                  <LogOut className="h-4 w-4 mr-1.5" />
                  Logout
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button
                    size="sm"
                    className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-5"
                  >
                    Join ERC
                  </Button>
                </Link>
              </div>
            )}
          </nav>

          <button
            type="button"
            className="relative z-50 md:hidden flex h-10 w-10 items-center justify-center rounded-full border bg-background"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        <div
          className={`fixed inset-0 top-16 z-40 md:hidden transition-all duration-300 ${
            open ? "visible opacity-100" : "invisible opacity-0 pointer-events-none"
          }`}
        >
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-x-0 top-0 border-b bg-background shadow-xl">
            <nav className="container mx-auto px-4 py-6 flex flex-col">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`py-3.5 text-base font-medium border-b border-border/60 ${
                    pathname === link.href ? "text-orange-500" : "hover:text-orange-500"
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 py-3.5 border-b border-border/60 hover:text-orange-500"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                  <Link
                    href="/tickets"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 py-3.5 border-b border-border/60 hover:text-orange-500"
                  >
                    <Ticket className="h-4 w-4" />
                    My Tickets
                  </Link>
                  <button
                    type="button"
                    onClick={() => setLogoutOpen(true)}
                    className="flex items-center gap-2 py-3.5 text-muted-foreground hover:text-orange-600 text-left"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-3 pt-6">
                  <Link href="/login" onClick={() => setOpen(false)}>
                    <Button variant="outline" className="w-full h-11 rounded-full">
                      Login
                    </Button>
                  </Link>
                  <Link href="/register" onClick={() => setOpen(false)}>
                    <Button className="w-full h-11 rounded-full bg-orange-500 hover:bg-orange-600 text-white">
                      Join ERC
                    </Button>
                  </Link>
                </div>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Logout confirm modal — no shadcn AlertDialog */}
      {logoutOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setLogoutOpen(false)}
          />
          <div className="relative w-full max-w-sm rounded-2xl border bg-background p-6 shadow-xl">
            <h2 className="text-lg font-semibold">Log out?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Are you sure you want to log out of your ERC account?
            </p>
            <div className="mt-6 flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setLogoutOpen(false)}>
                Cancel
              </Button>
              <Button
                className="bg-orange-500 hover:bg-orange-600 text-white"
                onClick={confirmLogout}
              >
                Yes, log out
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}