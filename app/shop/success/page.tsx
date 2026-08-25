"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  return (
    <main className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center rounded-2xl border bg-card p-8 shadow-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10">
          <CheckCircle2 className="h-8 w-8 text-emerald-600" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Order placed</h1>
        <p className="mt-2 text-muted-foreground text-sm">
          Thanks for shopping with Ẹ̀RC. We received your payment.
        </p>

        {orderId && (
          <p className="mt-4 text-xs text-muted-foreground break-all">
            Order ID:{" "}
            <span className="font-mono text-foreground">{orderId}</span>
          </p>
        )}

        <p className="mt-4 text-sm text-muted-foreground">
          We&apos;ll contact you with delivery updates using the details you
          provided at checkout.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/shop">
            <Button className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white">
              Continue shopping
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" className="w-full sm:w-auto">
              Log in to track orders
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function ShopSuccessPage() {
  return (
    <>
      <Navbar />
      <Suspense
        fallback={
          <div className="py-20 text-center text-muted-foreground">
            Loading...
          </div>
        }
      >
        <SuccessContent />
      </Suspense>
      <Footer />
    </>
  );
}