"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import type { Ticket } from "@/types";

type AgentRow = {
  agentId: string;
  agentName: string;
  count: number;
  tickets: Ticket[];
};

export default function AdminAgentsPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [usersMap, setUsersMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);

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
        const [ticketsSnap, usersSnap] = await Promise.all([
          getDocs(collection(db, "tickets")),
          getDocs(collection(db, "users")),
        ]);

        const map: Record<string, string> = {};
        usersSnap.forEach((d) => {
          const data = d.data();
          map[d.id] = data.name || data.email || d.id.slice(0, 8);
        });
        setUsersMap(map);

        setTickets(
          ticketsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Ticket))
        );
      } catch (err) {
        console.error(err);
        toast.error("Failed to load agent stats");
      } finally {
        setLoading(false);
      }
    })();
  }, [isAdmin]);

  const agentRows: AgentRow[] = useMemo(() => {
    const scanned = tickets.filter(
      (t) => t.status === "used" && t.scannedBy
    );
    const byAgent: Record<string, Ticket[]> = {};

    scanned.forEach((t) => {
      const id = t.scannedBy as string;
      if (!byAgent[id]) byAgent[id] = [];
      byAgent[id].push(t);
    });

    return Object.entries(byAgent)
      .map(([agentId, list]) => ({
        agentId,
        agentName:
          list[0]?.scannedByName ||
          usersMap[agentId] ||
          agentId.slice(0, 8) + "…",
        count: list.length,
        tickets: list.sort((a, b) => {
          const ta = a.usedAt ? new Date(String(a.usedAt)).getTime() : 0;
          const tb = b.usedAt ? new Date(String(b.usedAt)).getTime() : 0;
          return tb - ta;
        }),
      }))
      .sort((a, b) => b.count - a.count);
  }, [tickets, usersMap]);

  const totalScanned = agentRows.reduce((s, r) => s + r.count, 0);

  if (authLoading || !isAdmin) {
    return (
      <div className="py-16 text-center text-muted-foreground">
        Checking admin access...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Agent <span className="text-orange-500">scans</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Who scanned tickets and how many each agent handled.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:max-w-md">
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground uppercase">Agents</p>
          <p className="text-2xl font-bold">{agentRows.length}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground uppercase">Total scanned</p>
          <p className="text-2xl font-bold text-orange-600">{totalScanned}</p>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : agentRows.length === 0 ? (
        <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          No scanned tickets yet.
        </div>
      ) : (
        <div className="space-y-3">
          {agentRows.map((row) => (
            <div
              key={row.agentId}
              className="rounded-2xl border bg-card overflow-hidden"
            >
              <button
                type="button"
                className="w-full flex items-center justify-between gap-3 p-4 text-left hover:bg-muted/40 transition"
                onClick={() =>
                  setOpenId((id) => (id === row.agentId ? null : row.agentId))
                }
              >
                <div>
                  <p className="font-semibold">{row.agentName}</p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {row.agentId.slice(0, 12)}…
                  </p>
                </div>
                <span className="rounded-full bg-orange-500/10 text-orange-700 text-sm font-bold px-3 py-1">
                  {row.count} scanned
                </span>
              </button>

              {openId === row.agentId && (
                <div className="border-t px-4 py-3 space-y-2 bg-muted/20">
                  {row.tickets.map((t) => (
                    <div
                      key={t.id}
                      className="flex flex-wrap justify-between gap-2 text-sm py-2 border-b border-border/50 last:border-0"
                    >
                      <div>
                        <p className="font-medium">
                          {t.eventTitle || "Event"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t.userName || "Runner"} · {t.id.slice(0, 8)}…
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {t.usedAt
                          ? new Date(
                              // Firestore Timestamp or ISO string
                              typeof t.usedAt === "object" &&
                                t.usedAt !== null &&
                                "seconds" in (t.usedAt as object)
                                ? (t.usedAt as { seconds: number }).seconds *
                                    1000
                                : String(t.usedAt)
                            ).toLocaleString()
                          : "—"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}