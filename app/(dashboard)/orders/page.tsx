"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { formatCurrency } from "@/lib/utils";
import type { Order, OrderStatus } from "@/types";

function statusStyle(status: OrderStatus) {
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

function statusLabel(status: OrderStatus) {
  const map: Record<OrderStatus, string> = {
    pending: "Pending payment",
    paid: "Paid — preparing",
    processing: "Processing",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled",
  };
  return map[status] || status;
}

export default function MyOrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const q = query(
          collection(db, "orders"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc")
        );
        const snap = await getDocs(q);
        setOrders(
          snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order))
        );
      } catch (err) {
        console.error(err);
        // Fallback without orderBy if index missing
        try {
          const q2 = query(
            collection(db, "orders"),
            where("userId", "==", user.uid)
          );
          const snap2 = await getDocs(q2);
          const list = snap2.docs.map(
            (d) => ({ id: d.id, ...d.data() } as Order)
          );
          list.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() -
              new Date(a.createdAt).getTime()
          );
          setOrders(list);
        } catch (e) {
          console.error(e);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <p className="text-muted-foreground text-sm py-8">Loading orders...</p>
    );
  }

  if (!user) {
    return (
      <div className="py-8 text-sm text-muted-foreground">
        Please{" "}
        <Link href="/login" className="text-orange-600 hover:underline">
          log in
        </Link>{" "}
        to see your orders.
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1">
        My <span className="text-orange-500">Orders</span>
      </h1>
      <p className="text-sm text-muted-foreground mb-8">
        Products you bought and their delivery status.
      </p>

      {orders.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          No orders yet.{" "}
          <Link href="/shop" className="text-orange-600 hover:underline">
            Visit the shop
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <article
              key={order.id}
              className="rounded-2xl border bg-card p-4 sm:p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <div>
                  <p className="text-xs text-muted-foreground">
                    Order · {order.id.slice(0, 8)}…
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleString()
                      : ""}
                  </p>
                </div>
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${statusStyle(
                    order.status
                  )}`}
                >
                  {statusLabel(order.status)}
                </span>
              </div>

              <div className="space-y-3">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="flex gap-3 items-center">
                    <div className="relative h-14 w-14 shrink-0 rounded-lg overflow-hidden bg-muted">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="56px"
                        />
                      ) : null}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Qty {item.quantity} · {formatCurrency(item.price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t flex flex-wrap justify-between gap-2 text-sm">
                <span className="text-muted-foreground">
                  {order.address
                    ? `Ship to: ${order.address}`
                    : "No address provided"}
                </span>
                <span className="font-bold text-orange-600">
                  {formatCurrency(order.total)}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}