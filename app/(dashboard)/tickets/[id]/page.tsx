"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import QRCode from "qrcode";
import type { Ticket } from "@/types";

function isTicketExpired(
  ticket: { status: string; expiresAt?: string | null },
  eventDate?: string,
  eventTime?: string
) {
  if (ticket.status === "expired") return true;

  if (ticket.expiresAt) {
    const exp = new Date(ticket.expiresAt);
    if (!Number.isNaN(exp.getTime()) && exp.getTime() < Date.now()) {
      return true;
    }
  }

  if (eventDate) {
    const end = new Date(`${eventDate}T${eventTime || "23:59"}`);
    const graceMs = 6 * 60 * 60 * 1000;
    if (!Number.isNaN(end.getTime()) && Date.now() > end.getTime() + graceMs) {
      return true;
    }
  }

  return false;
}

function statusClass(status: string, expired: boolean) {
  if (expired || status === "expired") return "text-red-600 font-medium";
  if (status === "valid") return "text-green-600 font-medium";
  if (status === "used") return "text-amber-600 font-medium";
  return "text-red-600 font-medium";
}

export default function TicketPage() {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [qr, setQr] = useState("");
  const [error, setError] = useState("");
  const [eventDate, setEventDate] = useState<string | undefined>();
  const [eventTime, setEventTime] = useState<string | undefined>();

  useEffect(() => {
    if (authLoading || !user || !id) return;

    (async () => {
      try {
        const snap = await getDoc(doc(db, "tickets", id));
        if (!snap.exists()) {
          setError("Ticket not found");
          return;
        }

        const data = { id: snap.id, ...snap.data() } as Ticket;

        if (data.userId !== user.uid) {
          setError("This ticket is not yours");
          return;
        }

        setTicket(data);

        // Load event for date-based expiry
        if (data.eventId) {
          try {
            const eventSnap = await getDoc(doc(db, "events", data.eventId));
            if (eventSnap.exists()) {
              const ev = eventSnap.data();
              setEventDate(ev.date);
              setEventTime(ev.time);
            }
          } catch {
            // ignore
          }
        }

        const url = await QRCode.toDataURL(data.id, {
          width: 280,
          margin: 2,
          color: { dark: "#000000", light: "#ffffff" },
        });
        setQr(url);
      } catch (e: any) {
        setError(e.message || "Failed to load ticket");
      }
    })();
  }, [id, user, authLoading]);

  if (error) {
    return <p className="p-8 text-red-500">{error}</p>;
  }

  if (!ticket || !qr) {
    return <p className="p-8 text-muted-foreground">Loading ticket...</p>;
  }

  const expired = isTicketExpired(ticket, eventDate, eventTime);
  const displayStatus = expired ? "expired" : ticket.status;

  return (
    <div className="max-w-sm mx-auto text-center space-y-6 py-8">
      <h1 className="text-2xl font-bold">Your Ticket</h1>
      <p className="text-muted-foreground">{ticket.eventTitle}</p>

      {/* QR — dimmed if not usable */}
      <div
        className={`bg-white p-4 rounded-xl inline-block shadow ${
          expired || ticket.status === "used" || ticket.status === "cancelled"
            ? "opacity-40 grayscale"
            : ""
        }`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qr} alt="Ticket QR" className="w-64 h-64" />
      </div>

      <div className="text-sm space-y-1">
        <p>
          <span className="text-muted-foreground">Status: </span>
          <span className={statusClass(ticket.status, expired)}>
            {displayStatus}
          </span>
        </p>
        <p className="text-muted-foreground font-mono text-xs break-all">
          {ticket.id}
        </p>
        <p className="text-muted-foreground">
          {ticket.amountPaid > 0
            ? `Paid ₦${ticket.amountPaid.toLocaleString()}`
            : "Free"}
        </p>
      </div>

      {expired && (
        <p className="text-red-600 font-medium text-sm">
          This ticket has expired and cannot be used at entry.
        </p>
      )}

      {ticket.status === "used" && !expired && (
        <p className="text-amber-600 font-medium text-sm">
          This ticket has already been scanned.
        </p>
      )}

      {!expired && ticket.status === "valid" && (
        <p className="text-xs text-muted-foreground">
          Show this QR at the event for scanning
        </p>
      )}
    </div>
  );
}