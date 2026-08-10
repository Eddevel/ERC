"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/landing/Footer";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Event } from "@/types";
import { Calendar, MapPin, Users, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const q = query(collection(db, "events"), orderBy("date", "asc"));
        const snap = await getDocs(q);
        setEvents(
          snap.docs.map((d) => ({ id: d.id, ...d.data() } as Event))
        );
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-muted/30">
        {/* Header */}
        <section className="border-b bg-background">
          <div className="container mx-auto px-4 py-12 md:py-16">
            <span className="inline-block text-sm font-semibold tracking-wide uppercase text-orange-500 mb-2">
              Events
            </span>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Upcoming <span className="text-orange-500">Runs</span>
            </h1>
            <p className="mt-2 text-muted-foreground max-w-xl">
              Book your spot and run with Ẹ̀RC across Lagos. Free and paid events
              listed below.
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 py-10 md:py-14">
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-56 rounded-xl" />
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-20 rounded-2xl border border-dashed bg-card">
              <Ticket className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
              <p className="text-muted-foreground">No upcoming events yet.</p>
              <Link
                href="/dashboard"
                className="text-orange-600 font-medium hover:underline mt-2 inline-block"
              >
                Go to dashboard
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => {
                const spotsLeft = event.capacity - event.bookedCount;
                const isFree = !event.price || event.price <= 0;

                return (
                  <article
                    key={event.id}
                    className="group flex flex-col rounded-xl border border-border/60 bg-card shadow-md hover:shadow-xl transition-shadow overflow-hidden"
                  >
                    {/* Ticket body */}
                    <div className="relative flex-1 p-4 sm:p-5">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/10 text-orange-600 text-xs font-semibold px-2.5 py-1">
                          <Ticket className="h-3 w-3" />
                          {event.distance}
                        </span>
                        <span
                          className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${
                            spotsLeft <= 5
                              ? "bg-red-500/10 text-red-600"
                              : "bg-emerald-500/10 text-emerald-700"
                          }`}
                        >
                          {spotsLeft} left
                        </span>
                      </div>

                      <h2 className="font-bold text-base sm:text-lg leading-snug tracking-tight group-hover:text-orange-600 transition-colors">
                        {event.title}
                      </h2>

                      {event.description ? (
                        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                          {event.description}
                        </p>
                      ) : null}

                      <div className="mt-3 sm:mt-4 space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-start gap-2">
                          <Calendar className="h-3.5 w-3.5 shrink-0 mt-0.5 text-orange-500/80" />
                          <span>
                            {formatDate(event.date)} · {event.time}
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5 text-orange-500/80" />
                          <span className="break-words">{event.location}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Users className="h-3.5 w-3.5 shrink-0 mt-0.5 text-orange-500/80" />
                          <span>
                            {event.bookedCount}/{event.capacity} registered
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Tear line */}
                    <div className="relative h-0 border-t border-dashed border-border mx-3">
                      <span className="absolute -left-3 -top-3 h-6 w-6 rounded-full bg-muted/80 border border-border/50" />
                      <span className="absolute -right-3 -top-3 h-6 w-6 rounded-full bg-muted/80 border border-border/50" />
                    </div>

                    {/* Stub */}
                    <div className="flex flex-row items-center justify-between gap-3 px-4 py-3.5 sm:px-5 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-white/80">
                          Admit one
                        </p>
                        <p className="text-lg font-bold leading-none mt-1">
                          {isFree ? "FREE" : formatCurrency(event.price)}
                        </p>
                      </div>
                      <Link href="/dashboard" className="shrink-0">
                        <Button
                          size="sm"
                          className="bg-white text-orange-600 hover:bg-orange-50 font-semibold min-w-[5.5rem]"
                        >
                          Book
                        </Button>
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}