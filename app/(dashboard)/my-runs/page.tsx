"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import type { Ticket } from "@/types";
import { Medal, Calendar, MapPin, Ticket as TicketIcon, Trophy } from "lucide-react";

function isExpired(ticket: Ticket) {
  if (ticket.status === "expired") return true;
  if (ticket.expiresAt && new Date(ticket.expiresAt).getTime() < Date.now()) {
    return true;
  }
  return false;
}

function medalForCount(count: number) {
  if (count >= 10) {
    return { label: "Gold Pack", color: "from-amber-400 to-yellow-600", emoji: "🥇" };
  }
  if (count >= 5) {
    return { label: "Silver Pack", color: "from-slate-300 to-slate-500", emoji: "🥈" };
  }
  if (count >= 1) {
    return { label: "Bronze Pack", color: "from-orange-400 to-amber-700", emoji: "🥉" };
  }
  return null;
}

export default function MyRunsPage() {
  const { user, loading: authLoading } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !user) return;

    (async () => {
      try {
        const q = query(
          collection(db, "tickets"),
          where("userId", "==", user.uid)
        );
        const snap = await getDocs(q);
        const list = snap.docs.map(
          (d) => ({ id: d.id, ...d.data() } as Ticket)
        );
        list.sort(
          (a, b) =>
            new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime()
        );
        setTickets(list);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="py-12 text-muted-foreground text-sm">Loading your runs...</div>
    );
  }

  if (!user) {
    return <p className="py-12">Please log in to see your runs.</p>;
  }

  const upcoming = tickets.filter(
    (t) => t.status === "valid" && !isExpired(t)
  );
  const completed = tickets.filter((t) => t.status === "used");
  const other = tickets.filter(
    (t) =>
      t.status === "cancelled" ||
      t.status === "expired" ||
      isExpired(t)
  );

  const completedCount = completed.length;
  const packMedal = medalForCount(completedCount);

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          My <span className="text-orange-500">Runs</span>
        </h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">
          Track upcoming events, finished runs, and medals you&apos;ve earned.
        </p>
      </div>

      {/* Stats + medals */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border bg-card p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Upcoming
          </p>
          <p className="text-3xl font-bold mt-1 text-orange-600">
            {upcoming.length}
          </p>
        </div>
        <div className="rounded-2xl border bg-card p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Completed
          </p>
          <p className="text-3xl font-bold mt-1">{completedCount}</p>
        </div>
        <div className="rounded-2xl border bg-card p-4 shadow-sm flex items-center gap-3">
          <div
            className={`h-12 w-12 rounded-full bg-gradient-to-br ${
              packMedal?.color || "from-muted to-muted-foreground/30"
            } flex items-center justify-center text-xl shadow-inner`}
          >
            {packMedal ? packMedal.emoji : <Medal className="h-5 w-5 text-muted-foreground" />}
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Medal
            </p>
            <p className="font-semibold text-sm">
              {packMedal ? packMedal.label : "No medal yet"}
            </p>
            <p className="text-xs text-muted-foreground">
              {completedCount === 0
                ? "Finish a run to earn bronze"
                : `${completedCount} run${completedCount === 1 ? "" : "s"} completed`}
            </p>
          </div>
        </div>
      </div>

      {/* How medals work */}
      <div className="rounded-2xl border border-dashed border-orange-500/30 bg-orange-500/5 p-4 text-sm text-muted-foreground">
        <p className="font-medium text-foreground flex items-center gap-2 mb-2">
          <Trophy className="h-4 w-4 text-orange-500" />
          Medal levels
        </p>
        <ul className="grid sm:grid-cols-3 gap-2 text-xs sm:text-sm">
          <li>🥉 Bronze — 1+ completed runs</li>
          <li>🥈 Silver — 5+ completed runs</li>
          <li>🥇 Gold — 10+ completed runs</li>
        </ul>
        <p className="mt-2 text-xs">
          A run counts as completed when your ticket is scanned at the event.
        </p>
      </div>

      {/* Upcoming */}
      <section>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-orange-500" />
          Upcoming runs
        </h2>
        {upcoming.length === 0 ? (
          <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground text-sm">
            No upcoming runs.{" "}
            <Link href="/dashboard" className="text-orange-600 hover:underline">
              Book an event
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.map((t) => (
              <RunCard key={t.id} ticket={t} kind="upcoming" />
            ))}
          </div>
        )}
      </section>

      {/* Completed + medals per run */}
      <section>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Medal className="h-5 w-5 text-orange-500" />
          Completed runs & medals
        </h2>
        {completed.length === 0 ? (
          <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground text-sm">
            Finish a run (get scanned) to unlock your first medal.
          </div>
        ) : (
          <div className="space-y-3">
            {completed.map((t, index) => (
              <RunCard
                key={t.id}
                ticket={t}
                kind="completed"
                runNumber={completed.length - index}
              />
            ))}
          </div>
        )}
      </section>

      {/* Expired / cancelled */}
      {other.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-4 text-muted-foreground">
            Expired / cancelled
          </h2>
          <div className="space-y-3 opacity-80">
            {other.map((t) => (
              <RunCard key={t.id} ticket={t} kind="other" />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function RunCard({
  ticket,
  kind,
  runNumber,
}: {
  ticket: Ticket;
  kind: "upcoming" | "completed" | "other";
  runNumber?: number;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl border bg-card p-4 shadow-sm">
      {/* Medal / icon */}
      <div
        className={`h-14 w-14 shrink-0 rounded-2xl flex items-center justify-center text-2xl ${
          kind === "completed"
            ? "bg-gradient-to-br from-orange-400 to-amber-600 text-white shadow"
            : kind === "upcoming"
              ? "bg-orange-500/10 text-orange-600"
              : "bg-muted text-muted-foreground"
        }`}
      >
        {kind === "completed" ? "🏅" : <TicketIcon className="h-6 w-6" />}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-semibold truncate">
            {ticket.eventTitle || "ERC Run"}
          </h3>
          {kind === "completed" && (
            <span className="text-xs font-medium rounded-full bg-emerald-500/10 text-emerald-700 px-2 py-0.5">
              Completed {runNumber ? `· Run #${runNumber}` : ""}
            </span>
          )}
          {kind === "upcoming" && (
            <span className="text-xs font-medium rounded-full bg-orange-500/10 text-orange-700 px-2 py-0.5">
              Upcoming
            </span>
          )}
          {kind === "other" && (
            <span className="text-xs font-medium rounded-full bg-muted px-2 py-0.5 capitalize">
              {ticket.status}
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          {ticket.amountPaid > 0
            ? `₦${ticket.amountPaid.toLocaleString()}`
            : "Free"}
          {ticket.paidAt && (
            <span className="text-muted-foreground/80">
              · {new Date(ticket.paidAt).toLocaleDateString()}
            </span>
          )}
        </p>
        {kind === "completed" && (
          <p className="text-xs text-amber-700/90 mt-1 flex items-center gap-1">
            <Medal className="h-3.5 w-3.5" />
            Finisher medal earned
          </p>
        )}
      </div>

      {kind === "upcoming" && (
        <Link
          href={`/tickets/${ticket.id}`}
          className="shrink-0 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 text-center"
        >
          View QR
        </Link>
      )}
      {kind === "completed" && (
        <Link
          href={`/tickets/${ticket.id}`}
          className="shrink-0 rounded-lg border text-sm font-medium px-4 py-2 text-center hover:bg-muted"
        >
          View ticket
        </Link>
      )}
    </div>
  );
}