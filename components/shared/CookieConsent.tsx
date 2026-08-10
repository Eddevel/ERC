"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "erc-cookie-consent";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  const accept = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "accepted");
    } catch {
      // ignore
    }
    setVisible(false);
  };

  const decline = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "declined");
    } catch {
      // ignore
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-[90] p-4 md:p-6 pointer-events-none">
      <div className="pointer-events-auto mx-auto max-w-3xl rounded-2xl border bg-background/95 backdrop-blur-md shadow-xl p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">We use cookies</p>
            <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
              Ẹ̀ko Runners Club uses cookies and similar technologies to keep you
              signed in, remember preferences, and improve the site. By clicking
              Accept, you agree to our use of cookies.{" "}
              <Link
                href="/privacy"
                className="text-orange-600 font-medium hover:underline"
              >
                Learn more
              </Link>
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={decline}
              className="rounded-full"
            >
              Decline
            </Button>
            <Button
              size="sm"
              onClick={accept}
              className="rounded-full bg-orange-500 hover:bg-orange-600 text-white"
            >
              Accept
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}