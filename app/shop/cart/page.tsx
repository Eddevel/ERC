"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/landing/Footer";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

declare global {
  interface Window {
    PaystackPop: {
      setup: (config: Record<string, unknown>) => { openIframe: () => void };
    };
  }
}

export default function CartPage() {
  const { items, updateQty, remove, total, clear } = useCart();
  const { user, profile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const isSignedIn = !!user;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  // Prefill from account when signed in
  useEffect(() => {
    if (!user && !profile) return;
    setName(profile?.name || user?.displayName || "");
    setEmail(user?.email || profile?.email || "");
    setPhone(profile?.phone || "");
  }, [user, profile]);

  const checkout = () => {
  if (!items.length) {
    toast.error("Cart is empty");
    return;
  }

  const customerName = isSignedIn
    ? profile?.name || user?.displayName || ""
    : name.trim();
  const customerEmail = isSignedIn
    ? user?.email || profile?.email || ""
    : email.trim();
  const customerPhone = isSignedIn
    ? profile?.phone || ""
    : phone.trim();

  if (!isSignedIn && (!customerName || !customerEmail || !customerPhone)) {
    toast.error("Name, email and phone are required");
    return;
  }

  if (!address.trim()) {
    toast.error("Delivery address is required");
    return;
  }

  if (!customerEmail || !customerEmail.includes("@")) {
    toast.error("A valid email is required for payment");
    return;
  }

  if (!total || total <= 0) {
    toast.error("Invalid cart total");
    return;
  }

  const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
  if (!publicKey) {
    toast.error("Paystack key missing. Check .env.local");
    return;
  }

  if (typeof window === "undefined" || !window.PaystackPop) {
    toast.error("Paystack is still loading. Wait a second and try again.");
    return;
  }

  const reference = `SHOP-${Date.now()}`;
  const amountKobo = Math.round(Number(total) * 100);

  try {
    const handler = window.PaystackPop.setup({
      key: publicKey,
      email: customerEmail,
      amount: amountKobo,
      currency: "NGN",
      ref: reference,
      metadata: {
        custom_fields: [
          {
            display_name: "Customer",
            variable_name: "customer_name",
            value: customerName,
          },
        ],
      },
      callback: function (response: { reference: string }) {
        setLoading(true);
        fetch("/api/shop/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reference: response.reference,
            items,
            total,
            customerName,
            customerEmail,
            customerPhone: customerPhone || "",
            address: address.trim(),
            userId: user?.uid || null,
          }),
        })
          .then(async (res) => {
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Verification failed");
            clear();
            toast.success("Order placed!");
            router.push(user ? "/orders" : `/shop/success?orderId=${data.orderId}`);
          })
          .catch((err) => {
            console.error(err);
            toast.error(err.message || "Could not verify payment");
          })
          .finally(() => setLoading(false));
      },
      onClose: function () {
        toast.message("Payment closed");
      },
    });

    handler.openIframe();
  } catch (err: any) {
    console.error(err);
    toast.error(err?.message || "Could not start Paystack");
  }
};

  const inputClass =
    "w-full border rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500";

  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-10 max-w-3xl min-h-screen">
        <h1 className="text-2xl font-bold mb-6">Your cart</h1>

        {items.length === 0 ? (
          <p className="text-muted-foreground">
            Cart is empty.{" "}
            <Link href="/shop" className="text-orange-600 hover:underline">
              Continue shopping
            </Link>
          </p>
        ) : (
          <div className="space-y-8">
            {/* Line items — keep your existing list UI */}
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="flex gap-4 border rounded-xl p-3 bg-card"
                >
                  <div className="relative h-20 w-20 shrink-0 rounded-lg overflow-hidden bg-muted">
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-orange-600 font-semibold">
                      {formatCurrency(item.price)}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        type="button"
                        className="h-8 w-8 border rounded"
                        onClick={() =>
                          updateQty(item.productId, item.quantity - 1)
                        }
                      >
                        −
                      </button>
                      <span className="text-sm w-6 text-center">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        className="h-8 w-8 border rounded"
                        onClick={() =>
                          updateQty(item.productId, item.quantity + 1)
                        }
                      >
                        +
                      </button>
                      <button
                        type="button"
                        className="ml-auto text-xs text-red-600"
                        onClick={() => remove(item.productId)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Checkout */}
            <div className="rounded-2xl border p-5 space-y-4 bg-card">
              <h2 className="font-semibold">Checkout</h2>

              {isSignedIn ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    Ordering as{" "}
                    <span className="font-medium text-foreground">
                      {profile?.name || user?.email}
                    </span>
                    . We’ll use your account details — only add a delivery
                    address.
                  </p>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">
                      Delivery address *
                    </label>
                    <textarea
                      className={inputClass}
                      placeholder="Street, area, city, landmarks..."
                      rows={3}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      required
                    />
                  </div>
                </>
              ) : (
                <>
                  <p className="text-xs text-muted-foreground">
                    Guest checkout — or{" "}
                    <Link
                      href="/login"
                      className="text-orange-600 hover:underline"
                    >
                      log in
                    </Link>{" "}
                    to track orders in your account.
                  </p>
                  <input
                    className={inputClass}
                    placeholder="Full name *"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <input
                    className={inputClass}
                    placeholder="Email *"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <input
                    className={inputClass}
                    placeholder="Phone *"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  <textarea
                    className={inputClass}
                    placeholder="Delivery address *"
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </>
              )}

              <div className="flex items-center justify-between pt-2 gap-3">
                <span className="font-bold text-lg">
                  Total {formatCurrency(total)}
                </span>
                <Button
                  disabled={loading}
                  onClick={checkout}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  {loading ? "Processing..." : "Pay with Paystack"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}