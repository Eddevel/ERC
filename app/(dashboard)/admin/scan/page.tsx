"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Html5QrcodeScanner } from "html5-qrcode";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export default function AdminScanPage() {
  const { isAdmin, loading, user } = useAuth();
  const router = useRouter();
  const [lastResult, setLastResult] = useState("");

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!isAdmin) {
      router.replace("/dashboard");
    }
  }, [loading, user, isAdmin, router]);

  useEffect(() => {
    if (!isAdmin) return;

    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );

    let handling = false;

    scanner.render(
      async (decodedText) => {
        if (handling) return;
        handling = true;

        try {
          const ticketId = decodedText.trim();
          const ref = doc(db, "tickets", ticketId);
          const snap = await getDoc(ref);

          if (!snap.exists()) {
            toast.error("Invalid ticket");
            setLastResult("Invalid ticket");
            return;
          }

          const ticket = snap.data();

          if (ticket.status === "used") {
            toast.error(`Already used: ${ticket.userName || ticketId}`);
            setLastResult(`Already used — ${ticket.userName}`);
            return;
          }

          if (ticket.status !== "valid") {
            toast.error("Ticket not valid");
            setLastResult("Not valid");
            return;
          }

          await updateDoc(ref, {
            status: "used",
            usedAt: serverTimestamp(),
          });

          toast.success(`Verified: ${ticket.userName || "Runner"}`);
          setLastResult(`✓ ${ticket.userName} — ${ticket.eventTitle}`);
        } catch (e) {
          console.error(e);
          toast.error("Scan failed");
        } finally {
          setTimeout(() => {
            handling = false;
          }, 2000);
        }
      },
      () => {}
    );

    return () => {
      scanner.clear().catch(() => {});
    };
  }, [isAdmin]);

  if (loading || !isAdmin) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        Checking admin access...
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-2">Scan tickets</h1>
      <p className="text-muted-foreground text-sm mb-6">
        Point the camera at the runner’s QR code
      </p>

      <div id="qr-reader" className="rounded-xl overflow-hidden border" />

      {lastResult && (
        <p className="mt-4 text-center font-medium text-orange-600">
          {lastResult}
        </p>
      )}
    </div>
  );
}