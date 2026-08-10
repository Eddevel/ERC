"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import type { Event } from "@/types";

declare global {
  interface Window {
    PaystackPop: {
      setup: (config: Record<string, unknown>) => { openIframe: () => void };
    };
  }
}

interface Props {
  event: Event;
}

export function PaystackBookButton({ event }: Props) {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const spotsLeft = event.capacity - event.bookedCount;
  const soldOut = spotsLeft <= 0;
  const isFree = !event.price || event.price <= 0;
  const maxQty = Math.min(5, Math.max(1, spotsLeft)); // max 5 per order

  const total = (event.price || 0) * quantity;

  const handleFreeBook = async () => {
    if (!user) {
      toast.error("Please log in first");
      router.push("/login");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/tickets/free", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: event.id,
          userId: user.uid,
          userName: profile?.name || user.displayName || "Runner",
          userEmail: user.email || "",
          quantity,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Booking failed");

      toast.success(
        quantity > 1
          ? `${quantity} tickets booked!`
          : "Booked successfully!"
      );
      // First ticket QR, or list page
      router.push(
  data.ticketIds?.length > 1
    ? "/tickets"              // ← your My Tickets page
    : `/tickets/${data.ticketId || data.ticketIds?.[0]}`
);
    } catch (err: any) {
      toast.error(err.message || "Booking failed");
    } finally {
      setLoading(false);
    }
  };

  const handlePay = () => {
    if (!user) {
      toast.error("Please log in first");
      router.push("/login");
      return;
    }
    if (!window.PaystackPop) {
      toast.error("Payment loading... try again");
      return;
    }

    const reference = `ERC-${event.id}-${user.uid.slice(0, 8)}-${Date.now()}`;

    const handler = window.PaystackPop.setup({
      key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
      email: user.email || "",
      amount: Math.round(total * 100),
      currency: "NGN",
      ref: reference,
      metadata: {
        eventId: event.id,
        userId: user.uid,
        quantity,
      },
      callback: function (response: { reference: string }) {
        setLoading(true);
        fetch("/api/paystack/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reference: response.reference,
            eventId: event.id,
            userId: user.uid,
            userName: profile?.name || user.displayName,
            userEmail: user.email,
            quantity,
          }),
        })
          .then(async (res) => {
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Verification failed");
            toast.success("Payment successful!");
            router.push(
              data.ticketIds?.length > 1
                ? "/tickets"
                : `/tickets/${data.ticketId || data.ticketIds?.[0]}`
            );
          })
          .catch((err) => toast.error(err.message))
          .finally(() => setLoading(false));
      },
      onClose: () => toast.message("Payment closed"),
    });

    handler.openIframe();
  };

  return (
    <div className="flex flex-col gap-2 items-end">
      {!soldOut && (
        <div className="flex items-center gap-2">
          <label className="text-xs text-muted-foreground">Qty</label>
          <select
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="rounded-md border  px-2 py-1 text-sm"
          >
            {Array.from({ length: maxQty }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n} >
                {n}
              </option>
            ))}
          </select>
        </div>
      )}

      <button
        type="button"
        onClick={isFree ? handleFreeBook : handlePay}
        disabled={loading || soldOut}
        className="rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 disabled:opacity-50"
      >
        {soldOut
          ? "Sold out"
          : loading
            ? "Please wait..."
            : isFree
              ? `Book ${quantity} free`
              : `Pay ₦${total.toLocaleString()}`}
      </button>
    </div>
  );
}