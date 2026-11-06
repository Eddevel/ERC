"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { formatCurrency } from "@/lib/utils";
import type { Order, OrderStatus } from "@/types";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const STATUSES: OrderStatus[] = [
  "pending",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

function statusClass(status: string) {
  switch (status) {
    case "paid":
    case "processing":
      return "bg-sky-500/10 text-sky-700";
    case "shipped":
      return "bg-orange-500/10 text-orange-700";
    case "delivered":
      return "bg-emerald-500/10 text-emerald-700";
    case "cancelled":
      return "bg-red-500/10 text-red-700";
    default:
      return "bg-muted text-muted-foreground";
  }
}

export default function AdminOrdersPage() {
  const { user, canManageOrders, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!canManageOrders) {
      toast.error("Access required");
      router.replace("/dashboard");
    }
  }, [authLoading, user, canManageOrders, router]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order)));
    } catch (err) {
      console.error(err);
      // fallback if index / orderBy fails
      try {
        const snap = await getDocs(collection(db, "orders"));
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order));
        list.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setOrders(list);
      } catch (e) {
        console.error(e);
        toast.error("Failed to load orders");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canManageOrders) loadOrders();
  }, [canManageOrders]);

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    setUpdatingId(orderId);
    try {
      await updateDoc(doc(db, "orders", orderId), {
        status,
        updatedAt: new Date().toISOString(),
      });
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o))
      );
      toast.success(`Order marked as ${status}`);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Could not update status");
    } finally {
      setUpdatingId(null);
    }
  };

  if (authLoading || !canManageOrders) {
    return (
      <div className="py-16 text-center text-muted-foreground">
        Checking admin access...
      </div>
    );
  }

  const filtered =
    filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Shop <span className="text-orange-500">Orders</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          View purchased items and update delivery status.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {["all", ...STATUSES].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={`rounded-full px-3 py-1 text-xs font-medium capitalize border transition ${
              filter === s
                ? "bg-orange-500 text-white border-orange-500"
                : "bg-card hover:bg-muted"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading orders...</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          No orders found.
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => (
            <article
              key={order.id}
              className="rounded-2xl border bg-card p-4 sm:p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                <div>
                  <p className="font-semibold">
                    {order.customerName || "Customer"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {order.customerEmail}
                    {order.customerPhone ? ` · ${order.customerPhone}` : ""}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleString()
                      : ""}
                    {" · "}
                    <span className="font-mono">{order.id.slice(0, 8)}…</span>
                  </p>
                </div>
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${statusClass(
                    order.status
                  )}`}
                >
                  {order.status}
                </span>
              </div>

              {/* Items */}
              <div className="space-y-2 mb-4">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="relative h-12 w-12 shrink-0 rounded-lg overflow-hidden bg-muted">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      ) : null}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Qty {item.quantity} · {formatCurrency(item.price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-sm text-muted-foreground mb-3">
                <span className="font-medium text-foreground">Address: </span>
                {order.address || "—"}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t">
                <p className="font-bold text-orange-600">
                  {formatCurrency(order.total)}
                </p>

                <div className="flex flex-wrap items-center gap-2">
                  <label className="text-xs text-muted-foreground">Status</label>
                  <select
                    className="rounded-lg border px-2 py-1.5 text-sm bg-background"
                    value={order.status}
                    disabled={updatingId === order.id}
                    onChange={(e) =>
                      updateStatus(order.id, e.target.value as OrderStatus)
                    }
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={updatingId === order.id}
                    onClick={() => updateStatus(order.id, "shipped")}
                  >
                    Mark shipped
                  </Button>
                  <Button
                    size="sm"
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                    disabled={updatingId === order.id}
                    onClick={() => updateStatus(order.id, "delivered")}
                  >
                    Mark delivered
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}