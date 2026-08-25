"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/landing/Footer";
import { formatCurrency } from "@/lib/utils";
import type { Product } from "@/types";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { add } = useCart();

  useEffect(() => {
    (async () => {
      try {
        const q = query(
          collection(db, "products"),
          where("active", "==", true)
        );
        const snap = await getDocs(q);
        setProducts(
          snap.docs.map((d) => ({ id: d.id, ...d.data() } as Product))
        );
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-muted/30">
        <div className="container mx-auto px-4 py-10 md:py-14">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-sm font-semibold uppercase text-orange-500">
                Shop
              </span>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight mt-1">
                ERC <span className="text-orange-500">Merch</span>
              </h1>
              
            </div>
           
          </div>

          {loading ? (
            <p className="text-muted-foreground">Loading products...</p>
          ) : products.length === 0 ? (
            <p className="text-muted-foreground text-center py-16">
              No products yet. Check back soon.
            </p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((p) => (
                <article
                  key={p.id}
                  className="rounded-2xl border bg-card overflow-hidden shadow-sm hover:shadow-md transition flex flex-col"
                >
                  <div className="relative h-52 bg-muted">
                    <Image
                      src={p.imageUrl}
                      alt={p.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      loading="eager"
                    />
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <h2 className="font-semibold text-lg">{p.name}</h2>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {p.description}
                    </p>
                    <div className="mt-4 flex items-center justify-between gap-2">
                      <span className="font-bold text-orange-600">
                        {formatCurrency(p.price)}
                      </span>
                      <Button
                        size="sm"
                        className="bg-orange-500 hover:bg-orange-600 text-white"
                        disabled={p.stock <= 0}
                        onClick={() => {
                          add(p, 1);
                          toast.success("Added to cart");
                        }}
                      >
                        {p.stock <= 0 ? "Sold out" : "Add to cart"}
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}