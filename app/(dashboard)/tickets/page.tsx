"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import type { Ticket } from "@/types";

export default function MyTicketsPage() {
  const { user, loading: authLoading } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !user) return;

    (async () => {
      try {
        const q = query(
          collection(db, "tickets"),
          where("userId", "==", user.uid),
          orderBy("paidAt", "desc")
        );
        const snap = await getDocs(q);
        setTickets(
          snap.docs.map((d) => ({ id: d.id, ...d.data() } as Ticket))
        );
      } catch (err) {
        console.error(err);
        // Fallback without orderBy if index missing
        try {
          const q2 = query(
            collection(db, "tickets"),
            where("userId", "==", user.uid)
          );
          const snap2 = await getDocs(q2);
          const list = snap2.docs.map(
            (d) => ({ id: d.id, ...d.data() } as Ticket)
          );
          list.sort(
            (a, b) =>
              new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime()
          );
          setTickets(list);
        } catch (e) {
          console.error(e);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="py-12 text-muted-foreground">Loading tickets...</div>
    );
  }

  if (!user) {
    return <p className="py-12">Please log in to see your tickets.</p>;
  }

  const upcoming = tickets.filter((t) => t.status === "valid");
  const past = tickets.filter((t) => t.status !== "valid");

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Tickets</h1>
      <p className="text-muted-foreground mb-8">
        Your free and paid event tickets
      </p>

      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Active</h2>
        {upcoming.length === 0 ? (
          <p className="text-muted-foreground">
            No active tickets.{" "}
            <Link href="/dashboard" className="text-orange-600 hover:underline">
              Browse events
            </Link>
          </p>
        ) : (
          <div className="space-y-3">
            {upcoming.map((t) => (
              <TicketRow key={t.id} ticket={t} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Past / used</h2>
        {past.length === 0 ? (
          <p className="text-muted-foreground">No past tickets yet.</p>
        ) : (
          <div className="space-y-3">
            {past.map((t) => (
              <TicketRow key={t.id} ticket={t} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function TicketRow({ ticket }: { ticket: Ticket }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border bg-card p-4">
      <div>
        <p className="font-semibold">{ticket.eventTitle || "Event"}</p>
        <p className="text-sm text-muted-foreground mt-1">
          {ticket.amountPaid > 0
            ? `Paid ₦${ticket.amountPaid.toLocaleString()}`
            : "Free"}
          {" · "}
          <span
            className={
              ticket.status === "valid"
                ? "text-green-600"
                : "text-muted-foreground"
            }
          >
            {ticket.status}
          </span>
        </p>
      </div>
      {ticket.status === "valid" && (
        <Link
          href={`/tickets/${ticket.id}`}
          className="rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 text-center"
        >
          View QR
        </Link>
      )}
    </div>
  );
}