"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  collection,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  Users,
  Ticket,
  BadgeCheck,
  CircleDollarSign,
  ShoppingBag,
  Package,
  Eye,
} from "lucide-react";

type Stats = {
  users: number;
  siteVisits: number;
  ticketsBought: number;
  ticketsVerified: number;
  ticketsValid: number;
  ticketRevenue: number;
  shopOrders: number;
  shopRevenue: number;
  ordersPaid: number;
  ordersDelivered: number;
};

function BarChart({
  items,
}: {
  items: { label: string; value: number; color: string }[];
}) {
  const max = Math.max(...items.map((i) => i.value), 1);

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.label}>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-muted-foreground font-medium">
              {item.label}
            </span>
            <span className="font-semibold tabular-nums">{item.value}</span>
          </div>
          <div className="h-2.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${Math.max((item.value / max) * 100, 2)}%`,
                background: item.color,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function DonutChart({
  segments,
  centerLabel,
  centerValue,
}: {
  segments: { value: number; color: string; label: string }[];
  centerLabel: string;
  centerValue: string;
}) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const r = 40;
  const c = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <div className="relative h-36 w-36 shrink-0">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
          <circle
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke="currentColor"
            className="text-muted/40"
            strokeWidth="12"
          />
          {segments.map((seg) => {
            const len = (seg.value / total) * c;
            const dash = `${len} ${c - len}`;
            const el = (
              <circle
                key={seg.label}
                cx="50"
                cy="50"
                r={r}
                fill="none"
                stroke={seg.color}
                strokeWidth="12"
                strokeDasharray={dash}
                strokeDashoffset={-offset}
                strokeLinecap="round"
              />
            );
            offset += len;
            return el;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-2">
          <p className="text-lg font-bold tabular-nums leading-none">
            {centerValue}
          </p>
          <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wide">
            {centerLabel}
          </p>
        </div>
      </div>
      <ul className="space-y-2 text-sm w-full">
        {segments.map((seg) => (
          <li
            key={seg.label}
            className="flex items-center justify-between gap-3"
          >
            <span className="flex items-center gap-2 text-muted-foreground">
              <span
                className="h-2.5 w-2.5 rounded-full shrink-0"
                style={{ background: seg.color }}
              />
              {seg.label}
            </span>
            <span className="font-semibold tabular-nums">{seg.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function AdminStatsPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    users: 0,
    siteVisits: 0,
    ticketsBought: 0,
    ticketsVerified: 0,
    ticketsValid: 0,
    ticketRevenue: 0,
    shopOrders: 0,
    shopRevenue: 0,
    ordersPaid: 0,
    ordersDelivered: 0,
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

        let siteVisits = 0;
        try {
          const siteSnap = await getDoc(doc(db, "analytics", "site"));
          if (siteSnap.exists()) {
            siteVisits = Number(siteSnap.data().visits) || 0;
          }
        } catch {
          // optional
        }

        const ticketsSnap = await getDocs(collection(db, "tickets"));
        let ticketsVerified = 0;
        let ticketsValid = 0;
        let ticketRevenue = 0;
        ticketsSnap.forEach((d) => {
          const t = d.data();
          if (t.status === "used") ticketsVerified += 1;
          if (t.status === "valid") ticketsValid += 1;
          ticketRevenue += Number(t.amountPaid) || 0;
        });

        const ordersSnap = await getDocs(collection(db, "orders"));
        let shopRevenue = 0;
        let ordersPaid = 0;
        let ordersDelivered = 0;
        ordersSnap.forEach((d) => {
          const o = d.data();
          const status = o.status || "";
          if (status !== "cancelled" && status !== "pending") {
            shopRevenue += Number(o.total) || 0;
          }
          if (
            ["paid", "processing", "shipped", "delivered", "fulfilled"].includes(
              status
            )
          ) {
            ordersPaid += 1;
          }
          if (status === "delivered" || status === "fulfilled") {
            ordersDelivered += 1;
          }
        });

        setStats({
          users: usersSnap.data().count,
          siteVisits,
          ticketsBought: ticketsSnap.size,
          ticketsVerified,
          ticketsValid,
          ticketRevenue,
          shopOrders: ordersSnap.size,
          shopRevenue,
          ordersPaid,
          ordersDelivered,
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

  const totalRevenue = stats.ticketRevenue + stats.shopRevenue;

  const cards = [
    {
      label: "Registered users",
      value: stats.users,
      icon: Users,
      hint: "Accounts in Firestore",
    },
    {
      label: "Site visits",
      value: stats.siteVisits,
      icon: Eye,
      hint: "Sessions tracked",
    },
    {
      label: "Shop orders",
      value: stats.shopOrders,
      icon: ShoppingBag,
      hint: `${stats.ordersPaid} paid · ${stats.ordersDelivered} delivered`,
    },
    {
      label: "Shop revenue (₦)",
      value: stats.shopRevenue.toLocaleString(),
      icon: Package,
      hint: "Merch sales",
    },
    {
      label: "Tickets bought",
      value: stats.ticketsBought,
      icon: Ticket,
      hint: "Free + paid",
    },
    {
      label: "Tickets verified",
      value: stats.ticketsVerified,
      icon: BadgeCheck,
      hint: `Valid: ${stats.ticketsValid}`,
    },
    {
      label: "Ticket revenue (₦)",
      value: stats.ticketRevenue.toLocaleString(),
      icon: CircleDollarSign,
      hint: "Event tickets",
    },
    {
      label: "Total revenue (₦)",
      value: totalRevenue.toLocaleString(),
      icon: CircleDollarSign,
      hint: "Tickets + shop",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1">
          Site <span className="text-orange-500">stats</span>
        </h1>
        <p className="text-muted-foreground text-sm">
          Members, visits, shop orders, tickets, and revenue.
        </p>
      </div>

      {loading ? (
        <p className="text-muted-foreground text-sm">Loading stats...</p>
      ) : (
        <>
          {/* Cards first */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map((c) => (
              <div
                key={c.label}
                className="rounded-2xl border bg-card p-5 shadow-sm hover:shadow-md hover:border-orange-500/20 transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      {c.label}
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold mt-1 tabular-nums">
                      {c.value}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {c.hint}
                    </p>
                  </div>
                  <div className="h-11 w-11 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0">
                    <c.icon className="h-5 w-5 text-orange-500" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Charts below — mobile + tablet + desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl border bg-gradient-to-br from-card to-orange-500/5 p-5 sm:p-6 shadow-sm">
              <h2 className="text-sm font-semibold mb-5">Activity overview</h2>
              <BarChart
                items={[
                  {
                    label: "Site visits",
                    value: stats.siteVisits,
                    color: "#f97316",
                  },
                  {
                    label: "Registered users",
                    value: stats.users,
                    color: "#fb923c",
                  },
                  {
                    label: "Shop orders",
                    value: stats.shopOrders,
                    color: "#fdba74",
                  },
                  {
                    label: "Tickets bought",
                    value: stats.ticketsBought,
                    color: "#ea580c",
                  },
                  {
                    label: "Tickets verified",
                    value: stats.ticketsVerified,
                    color: "#c2410c",
                  },
                ]}
              />
            </div>

            <div className="rounded-2xl border bg-gradient-to-br from-card to-orange-500/5 p-5 sm:p-6 shadow-sm">
              <h2 className="text-sm font-semibold mb-5">Revenue split</h2>
              <DonutChart
                centerLabel="Total ₦"
                centerValue={
                  totalRevenue >= 1000
                    ? `${(totalRevenue / 1000).toFixed(1)}k`
                    : String(totalRevenue)
                }
                segments={[
                  {
                    label: "Tickets",
                    value: stats.ticketRevenue || 0,
                    color: "#f97316",
                  },
                  {
                    label: "Shop",
                    value: stats.shopRevenue || 0,
                    color: "#fdba74",
                  },
                ]}
              />
              <div className="mt-6 grid grid-cols-2 gap-3 text-center">
                <div className="rounded-xl bg-orange-500/10 p-3">
                  <p className="text-[10px] uppercase text-muted-foreground">
                    Ticket ₦
                  </p>
                  <p className="font-bold tabular-nums">
                    {stats.ticketRevenue.toLocaleString()}
                  </p>
                </div>
                <div className="rounded-xl bg-orange-500/10 p-3">
                  <p className="text-[10px] uppercase text-muted-foreground">
                    Shop ₦
                  </p>
                  <p className="font-bold tabular-nums">
                    {stats.shopRevenue.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}