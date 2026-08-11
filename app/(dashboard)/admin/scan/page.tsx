"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Html5Qrcode } from "html5-qrcode";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type ScanStatus = "idle" | "scanning" | "success" | "error";

export default function AdminScanPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const handlingRef = useRef(false);
  const [status, setStatus] = useState<ScanStatus>("idle");
  const [message, setMessage] = useState("");
  const [lastTicket, setLastTicket] = useState<{
    id: string;
    name: string;
    event: string;
  } | null>(null);
  const [cameraOn, setCameraOn] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!isAdmin) {
      toast.error("Admin only");
      router.replace("/dashboard");
    }
  }, [authLoading, user, isAdmin, router]);

  const stopScanner = async () => {
    const scanner = scannerRef.current;
    if (!scanner) return;
    try {
      if (scanner.isScanning) {
        await scanner.stop();
      }
      await scanner.clear();
    } catch {
      // ignore
    }
    scannerRef.current = null;
    setCameraOn(false);
  };

  const processTicket = async (raw: string) => {
    if (handlingRef.current) return;
    handlingRef.current = true;

    const ticketId = raw.trim();
    setStatus("scanning");
    setMessage("Checking ticket...");

    try {
      const ref = doc(db, "tickets", ticketId);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        setStatus("error");
        setMessage("Invalid ticket — not found");
        toast.error("Invalid ticket");
        return;
      }

      const ticket = snap.data();

      if (ticket.status === "used") {
        setStatus("error");
        setMessage(
          `Already scanned — ${ticket.userName || "Runner"} (${ticket.eventTitle || "event"})`
        );
        toast.error("Ticket already used");
        setLastTicket({
          id: ticketId,
          name: ticket.userName || "Runner",
          event: ticket.eventTitle || "",
        });
        return;
      }

      if (ticket.status !== "valid") {
        setStatus("error");
        setMessage(`Ticket status: ${ticket.status}`);
        toast.error("Ticket not valid");
        return;
      }

      // Mark as scanned / used
      await updateDoc(ref, {
        status: "used",
        usedAt: serverTimestamp(),
        scannedBy: user?.uid || null,
      });

      setStatus("success");
      setMessage(`Verified: ${ticket.userName || "Runner"}`);
      setLastTicket({
        id: ticketId,
        name: ticket.userName || "Runner",
        event: ticket.eventTitle || "",
      });
      toast.success(`Scanned — ${ticket.userName || "Runner"}`);
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setMessage(err?.message || "Scan failed (check permissions)");
      toast.error("Could not update ticket");
    } finally {
      setTimeout(() => {
        handlingRef.current = false;
        setStatus((s) => (s === "scanning" ? "idle" : s));
      }, 2500);
    }
  };

  const startScanner = async () => {
    if (!isAdmin) return;

    await stopScanner();
    setMessage("");
    setStatus("idle");

    const scanner = new Html5Qrcode("qr-reader");
    scannerRef.current = scanner;

    try {
      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 8,
          qrbox: { width: 240, height: 240 },
          aspectRatio: 1,
        },
        async (decodedText) => {
          await processTicket(decodedText);
        },
        () => {
          // ignore frame errors
        }
      );
      setCameraOn(true);
    } catch (err: any) {
      console.error(err);
      toast.error(
        err?.message?.includes("Permission")
          ? "Camera permission denied"
          : "Could not start camera"
      );
      setMessage("Allow camera access and try again");
      setStatus("error");
      setCameraOn(false);
    }
  };

  useEffect(() => {
    return () => {
      stopScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (authLoading || !isAdmin) {
    return (
      <div className="py-16 text-center text-muted-foreground">
        Checking admin access...
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold tracking-tight">Scan tickets</h1>
      <p className="text-sm text-muted-foreground mt-1 mb-6">
        Point the camera at the runner&apos;s QR code. Valid tickets are marked
        as scanned.
      </p>

      <div className="flex gap-2 mb-4">
        {!cameraOn ? (
          <Button
            onClick={startScanner}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            Start camera
          </Button>
        ) : (
          <Button variant="outline" onClick={stopScanner}>
            Stop camera
          </Button>
        )}
      </div>

      <div
        id="qr-reader"
        className="rounded-xl overflow-hidden border bg-black/5 min-h-[240px]"
      />

      {message && (
        <div
          className={`mt-4 rounded-xl border p-4 text-sm font-medium ${
            status === "success"
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700"
              : status === "error"
                ? "border-red-500/40 bg-red-500/10 text-red-700"
                : "border-border bg-muted/50 text-muted-foreground"
          }`}
        >
          {message}
          {lastTicket && (
            <p className="mt-1 text-xs opacity-80 font-normal">
              {lastTicket.event} · ID: {lastTicket.id.slice(0, 12)}…
            </p>
          )}
        </div>
      )}

      <p className="mt-4 text-xs text-muted-foreground">
        QR must contain the Firestore ticket document ID. After a successful
        scan, status becomes <strong>used</strong>.
      </p>
    </div>
  );
}