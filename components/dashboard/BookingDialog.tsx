"use client";

import { useState } from "react";
import { Event } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { createBooking } from "@/lib/firestore";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BookingDialogProps {
  event: Event;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function BookingDialog({
  event,
  open,
  onOpenChange,
  onSuccess,
}: BookingDialogProps) {
  const { user } = useAuth();
  const [tickets, setTickets] = useState(1);
  const [loading, setLoading] = useState(false);

  const spotsLeft = event.capacity - event.bookedCount;
  const total = event.price * tickets;

  const handleBook = async () => {
    if (!user) {
      toast.error("Please log in to book");
      return;
    }

    setLoading(true);
    try {
      await createBooking(user.uid, event.id, tickets);

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#F97316", "#fb923c", "#fdba74", "#ffffff"],
      });

      toast.success(`Successfully booked ${tickets} ticket(s)! 🎉`);
      onOpenChange(false);
      onSuccess?.();
    } catch (err: any) {
      toast.error(err.message || "Booking failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Book Ticket</DialogTitle>
          <DialogDescription>
            Confirm your spot for <strong>{event.title}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="rounded-lg bg-muted p-4 text-sm space-y-1">
            <p><span className="text-muted-foreground">Date:</span> {formatDate(event.date)} · {event.time}</p>
            <p><span className="text-muted-foreground">Location:</span> {event.location}</p>
            <p><span className="text-muted-foreground">Distance:</span> {event.distance}</p>
            <p><span className="text-muted-foreground">Price:</span> {formatCurrency(event.price)} / ticket</p>
          </div>

          <div>
            <Label htmlFor="tickets">Number of tickets</Label>
            <Input
              id="tickets"
              type="number"
              min={1}
              max={Math.min(5, spotsLeft)}
              value={tickets}
              onChange={(e) => setTickets(Number(e.target.value))}
              className="mt-1.5"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Max {Math.min(5, spotsLeft)} tickets · {spotsLeft} spots remaining
            </p>
          </div>

          <div className="flex justify-between items-center text-lg font-semibold">
            <span>Total</span>
            <span className="text-brand-600">{formatCurrency(total)}</span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className="bg-brand-500 hover:bg-brand-600"
            onClick={handleBook}
            disabled={loading || tickets < 1 || tickets > spotsLeft}
          >
            {loading ? "Booking..." : "Confirm Booking"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}