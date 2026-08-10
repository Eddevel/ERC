"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import QRCode from "qrcode";
import type { Ticket } from "@/types";

export default function TicketPage() {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [qr, setQr] = useState("");
  const [error, setError] = useState("");

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
          // allow admin later if needed
          setError("This ticket is not yours");
          return;
        }

        setTicket(data);
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

  return (
    <div className="max-w-sm mx-auto text-center space-y-6 py-8">
      <h1 className="text-2xl font-bold">Your Ticket</h1>
      <p className="text-muted-foreground">{ticket.eventTitle}</p>

      <div className="bg-white p-4 rounded-xl inline-block shadow">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qr} alt="Ticket QR" className="w-64 h-64" />
      </div>

      <div className="text-sm space-y-1">
        <p>
          <span className="text-muted-foreground">Status: </span>
          <span
            className={
              ticket.status === "valid"
                ? "text-green-600 font-medium"
                : "text-red-600 font-medium"
            }
          >
            {ticket.status}
          </span>
        </p>
        <p className="text-muted-foreground font-mono text-xs break-all">
          {ticket.id}
        </p>
        <p className="text-muted-foreground">
          Paid ₦{ticket.amountPaid?.toLocaleString()}
        </p>
      </div>

      <p className="text-xs text-muted-foreground">
        Show this QR at the event for scanning
      </p>
    </div>
  );
}