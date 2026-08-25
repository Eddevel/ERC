"use client";

import { useEffect } from "react";
import { doc, increment, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const SESSION_KEY = "erc-visit-tracked";

export function SiteVisitTracker() {
  useEffect(() => {
    try {
      if (sessionStorage.getItem(SESSION_KEY)) return;
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      // sessionStorage blocked — still try once per mount
    }

    const ref = doc(db, "analytics", "site");
    setDoc(
      ref,
      {
        visits: increment(1),
        lastVisitAt: new Date().toISOString(),
      },
      { merge: true }
    ).catch((err) => {
      console.warn("Visit track failed", err);
    });
  }, []);

  return null;
}