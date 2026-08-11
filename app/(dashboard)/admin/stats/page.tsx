"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  collection,
  getCountFromServer,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Users, Ticket, BadgeCheck, CircleDollarSign } from "lucide-react";

export default function AdminStatsPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    users: 0,
    ticketsBought: 0,
    ticketsVerified: 0,
    ticketsValid: 0,
    revenue: 0,
  });

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!isAdmin) {
      toast.error("Admin only");
      router.replace("/dashboard");
    }
  }, [authLoading, user, isAdmin, router]);

  useEffect(() => {
    if (!isAdmin) return;

    (async () => {
      try {
        const usersSnap = await getCountFromServer(collection(db, "users"));
        const ticketsSnap = await getDocs(collection(db, "tickets"));

        let verified = 0;
        let valid = 0;
        let revenue = 0;

        ticketsSnap.forEach((d) => {
          const t = d.data();
          if (t.status === "used") verified += 1;
          if (t.status === "valid") valid += 1;
          revenue += Number(t.amountPaid) || 0;
        });

        setStats({
          users: usersSnap.data().count,
          ticketsBought: ticketsSnap.size,
          ticketsVerified: verified,
          ticketsValid: valid,
          revenue,
        });
      } catch (err) {
        console.error(err);
        toast.error("Failed to load stats");
      } finally {
        setLoading(false);
      }
    })();
  }, [isAdmin]);

  if (authLoading || !isAdmin) {
    return (
      <div className="py-16 text-center text-muted-foreground">
        Checking admin access...
      </div>
    );
  }

  const cards = [
    {
      label: "Total users",
      value: stats.users,
      icon: Users,
      hint: "Registered accounts",
    },
    {
      label: "Tickets bought",
      value: stats.ticketsBought,
      icon: Ticket,
      hint: "All free + paid tickets",
    },
    {
      label: "Tickets verified",
      value: stats.ticketsVerified,
      icon: BadgeCheck,
      hint: "Scanned at entry (used)",
    },
    {
      label: "Revenue (₦)",
      value: stats.revenue.toLocaleString(),
      icon: CircleDollarSign,
      hint: `Active valid tickets: ${stats.ticketsValid}`,
    },
  ];

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1">
        Site <span className="text-orange-500">stats</span>
      </h1>
      <p className="text-muted-foreground text-sm mb-8">
        Overview of members, tickets, and verifications.
      </p>

      {loading ? (
        <p className="text-muted-foreground text-sm">Loading stats...</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {cards.map((c) => (
            <div
              key={c.label}
              className="rounded-2xl border bg-card p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    {c.label}
                  </p>
                  <p className="text-3xl font-bold mt-1 tabular-nums">
                    {c.value}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">{c.hint}</p>
                </div>
                <div className="h-11 w-11 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0">
                  <c.icon className="h-5 w-5 text-orange-500" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}