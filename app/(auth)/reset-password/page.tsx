"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { completePasswordReset } from "@/lib/auth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function ResetForm() {
  const search = useSearchParams();
  const router = useRouter();
  const oobCode = search.get("oobCode") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      toast.error("Use at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      await completePasswordReset(oobCode, password);
      toast.success("Password updated. You can log in now.");
      router.replace("/login");
    } catch (err: any) {
      const code = err?.code || "";
      if (code.includes("expired") || code.includes("invalid")) {
        toast.error("This reset link is invalid or expired. Request a new one.");
      } else {
        toast.error(err.message || "Could not reset password");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!oobCode) {
    return (
      <p className="text-sm text-muted-foreground">
        Missing reset code.{" "}
        <Link href="/login" className="text-orange-600 underline">
          Back to login
        </Link>
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 max-w-sm w-full">
      <h1 className="text-2xl font-bold">Set new password</h1>
      <input
        type="password"
        autoComplete="new-password"
        placeholder="New password (min 8 characters)"
        className="w-full border rounded-lg px-3 py-2.5 text-sm"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        minLength={8}
      />
      <input
        type="password"
        autoComplete="new-password"
        placeholder="Confirm password"
        className="w-full border rounded-lg px-3 py-2.5 text-sm"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        required
        minLength={8}
      />
      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white"
      >
        {loading ? "Saving..." : "Update password"}
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Suspense fallback={<p>Loading...</p>}>
        <ResetForm />
      </Suspense>
    </div>
  );
}