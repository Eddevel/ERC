"use client";

import { useEffect, useState } from "react";
import { getUpcomingEvents } from "@/lib/firestore";
import { Event } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, Ticket } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

export function UpcomingEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUpcomingEvents(3)
      .then(setEvents)
      .finally(() => setLoading(false));
  }, []);

  return (
    <section
      id="events"
      className="relative py-16 sm:py-20 md:py-28 bg-muted/40 overflow-hidden"
    >
      <div className="pointer-events-none absolute top-20 left-10 h-64 w-64 rounded-full bg-orange-500/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-10 right-10 h-48 w-48 rounded-full bg-orange-400/10 blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 sm:mb-12">
          <div>
            <span className="inline-block text-sm font-semibold tracking-wide uppercase text-orange-500 mb-2">
              On the calendar
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
              Upcoming <span className="text-orange-500">Events</span>
            </h2>
            <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-md">
              Lace up and join us on the roads of Lagos.
            </p>
          </div>
          <Link href="/events" className="shrink-0">
            <Button
              variant="outline"
              className="w-full sm:w-auto border-orange-500/30 hover:bg-orange-500/10 hover:text-orange-600"
            >
              View all events
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="grid gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-56 sm:h-64 rounded-xl" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-16 rounded-2xl border border-dashed bg-card/50">
            <Ticket className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">
              No upcoming events. Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => {
              const spotsLeft = event.capacity - event.bookedCount;
              const isFree = !event.price || event.price <= 0;

              return (
                <article
                  key={event.id}
                  className="group flex flex-col rounded-xl border border-border/60 bg-card shadow-md hover:shadow-xl transition-shadow overflow-hidden"
                >
                  {/* Main body */}
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

                    <h3 className="font-bold text-base sm:text-lg leading-snug tracking-tight group-hover:text-orange-600 transition-colors">
                      {event.title}
                    </h3>

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

                  {/* Dashed tear line */}
                  <div className="relative h-0 border-t border-dashed border-border mx-3">
                    <span className="absolute -left-3 -top-3 h-6 w-6 rounded-full bg-muted/80 border border-border/50" />
                    <span className="absolute -right-3 -top-3 h-6 w-6 rounded-full bg-muted/80 border border-border/50" />
                  </div>

                  {/* Stub — full width on mobile */}
                  <div className="flex flex-row sm:flex-row items-center justify-between gap-3 px-4 py-3.5 sm:px-5 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
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
      </div>
    </section>
  );
}