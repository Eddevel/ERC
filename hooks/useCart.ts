"use client";

import { useEffect, useState } from "react";
import type { CartItem, Product } from "@/types";

const KEY = "erc-cart";

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

  const save = (next: CartItem[]) => {
    setItems(next);
    localStorage.setItem(KEY, JSON.stringify(next));
  };

  const add = (product: Product, qty = 1) => {
    const existing = items.find((i) => i.productId === product.id);
    if (existing) {
      save(
        items.map((i) =>
          i.productId === product.id
            ? { ...i, quantity: i.quantity + qty }
            : i
        )
      );
    } else {
      save([
        ...items,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl,
          quantity: qty,
        },
      ]);
    }
  };

  const updateQty = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      save(items.filter((i) => i.productId !== productId));
      return;
    }
    save(
      items.map((i) =>
        i.productId === productId ? { ...i, quantity } : i
      )
    );
  };

  const remove = (productId: string) => {
    save(items.filter((i) => i.productId !== productId));
  };

  const clear = () => save([]);

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return { items, add, updateQty, remove, clear, total, count };
}