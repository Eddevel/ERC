"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getUserBookings, getEvent } from "@/lib/firestore";
import { Booking, Event } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, MapPin } from "lucide-react";

interface BookingWithEvent extends Booking {
  event?: Event;
}

export default function MyRunsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<BookingWithEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    async function load() {
      const raw = await getUserBookings(user!.uid);
      const withEvents = await Promise.all(
        raw.map(async (b) => {
          const event = await getEvent(b.eventId);
          return { ...b, event: event || undefined };
        })
      );
      setBookings(withEvents);
      setLoading(false);
    }

    load();
  }, [user]);

  const upcoming = bookings.filter(
    (b) => b.event && new Date(b.event.date) >= new Date() && b.status === "confirmed"
  );
  const past = bookings.filter(
    (b) => b.event && new Date(b.event.date) < new Date()
  );

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">My Runs</h1>
      <p className="text-muted-foreground mb-8">
        Your upcoming and past bookings with ERC.
      </p>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : (
        <>
          <section className="mb-12">
            <h2 className="text-xl font-semibold mb-4">Upcoming</h2>
            {upcoming.length === 0 ? (
              <p className="text-muted-foreground">No upcoming runs. Book one from the dashboard!</p>
            ) : (
              <div className="space-y-4">
                {upcoming.map((b) => (
                  <BookingRow key={b.id} booking={b} />
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">Past Runs</h2>
            {past.length === 0 ? (
              <p className="text-muted-foreground">No past runs yet.</p>
            ) : (
              <div className="space-y-4">
                {past.map((b) => (
                  <BookingRow key={b.id} booking={b} isPast />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function BookingRow({
  booking,
  isPast = false,
}: {
  booking: BookingWithEvent;
  isPast?: boolean;
}) {
  if (!booking.event) return null;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border bg-card p-5">
      <div>
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">{booking.event.title}</h3>
          <Badge variant={isPast ? "secondary" : "default"}>
            {booking.status}
          </Badge>
        </div>
        <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {formatDate(booking.event.date)} · {booking.event.time}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {booking.event.location}
          </span>
        </div>
      </div>
      <div className="text-right">
        <p className="font-medium">{booking.tickets} ticket(s)</p>
        <p className="text-sm text-brand-600">
          {formatCurrency(booking.event.price * booking.tickets)}
        </p>
      </div>
    </div>
  );
}