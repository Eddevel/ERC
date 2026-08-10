"use client";

import { Event } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Calendar, MapPin, Users, Ticket } from "lucide-react";
import { PaystackBookButton } from "@/components/dashboard/PaystackBookButton";

interface EventCardProps {
  event: Event;
  onBooked?: () => void;
}

export function EventCard({ event, onBooked }: EventCardProps) {
  const spotsLeft = event.capacity - event.bookedCount;
  const isFree = !event.price || event.price <= 0;
  const soldOut = spotsLeft <= 0;

  return (
    <article className="group flex flex-col rounded-xl border border-border/60 bg-card shadow-md hover:shadow-xl transition-shadow overflow-hidden h-full">
      {/* Image / fallback */}
      <div className="relative h-36 sm:h-40 w-full bg-muted overflow-hidden">
        {event.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={event.imageUrl}
            alt={event.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
            <span className="text-white text-3xl font-bold opacity-90">
              {event.distance}
            </span>
          </div>
        )}

        <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-black/50 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1">
          <Ticket className="h-3 w-3" />
          {event.distance}
        </span>

        <span
          className={`absolute top-3 right-3 text-xs font-medium px-2 py-0.5 rounded-full backdrop-blur-sm ${
            soldOut
              ? "bg-neutral-800/90 text-white"
              : spotsLeft <= 5
                ? "bg-red-500/90 text-white"
                : "bg-white/90 text-emerald-700"
          }`}
        >
          {soldOut ? "Sold out" : `${spotsLeft} left`}
        </span>
      </div>

      {/* Body */}
      <div className="relative flex-1 p-4 sm:p-5 flex flex-col">
        <h3 className="font-bold text-base sm:text-lg leading-snug tracking-tight group-hover:text-orange-600 transition-colors">
          {event.title}
        </h3>

        {event.description ? (
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
            {event.description}
          </p>
        ) : null}

        <div className="mt-3 sm:mt-4 space-y-2 text-sm text-muted-foreground flex-1">
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

      {/* Stub — price + pay/book */}
      <div className="flex flex-row items-center justify-between gap-3 px-4 py-3.5 sm:px-5 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-white/80">
            Admit one
          </p>
          <p className="text-lg font-bold leading-none mt-1">
            {isFree ? "FREE" : formatCurrency(event.price)}
          </p>
        </div>
        <div className="shrink-0 [&_button]:bg-white [&_button]:text-orange-600 [&_button]:hover:bg-orange-50 [&_button]:font-semibold">
          <PaystackBookButton event={event} />
        </div>
      </div>
    </article>
  );
}