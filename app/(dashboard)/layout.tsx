"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Navbar } from "@/components/shared/Navbar";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import Link from "next/link";
import { LayoutDashboard, Calendar, User, Shield, CameraIcon, Ticket } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar />
      <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-64 shrink-0">
          <nav className="space-y-1 sticky top-24">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-brand-500/10 hover:text-brand-600 transition"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
         
  
            
            <Link
              href="/profile"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-brand-500/10 hover:text-brand-600 transition"
            >
              <User className="h-4 w-4" />
              Profile
            </Link>
            <Link
              href="/tickets"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-brand-500/10 hover:text-brand-600 transition"
            >
              <Ticket className="h-4 w-4" />
              My Tickets
            </Link>
            <Link
              href="/my-runs"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-brand-500/10 hover:text-brand-600 transition"
            >
              <Calendar className="h-4 w-4" />
              My Runs
            </Link>
            {isAdmin && (
             <Link
              href="/admin/events"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-brand-500/10 hover:text-brand-600 transition"
            >
              <Shield className="h-4 w-4" />
              Manage Event
            </Link>
)}
            {isAdmin && (

             <Link
              href="/admin/scan"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-brand-500/10 hover:text-brand-600 transition"
            >
              <CameraIcon className="h-4 w-4" />
              Scan Ticket
            </Link>
)}

           
          </nav>
        </aside>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}