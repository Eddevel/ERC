"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { toast } from "sonner";
import Link from "next/link";

const CLUB_BRANCHES = [
  "Lekki",
  "Ajah",
  "UNILAG",
  "Ikeja",
  "Yaba",
  "Surulere",
  "Victoria Island",
  "Ikorodu",
  "Other",
] as const;

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [branch, setBranch] = useState("");
  const [homeLandmark, setHomeLandmark] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Non-blocking Firestore save
  const saveUserDocInBackground = (
    uid: string,
    data: {
      name: string;
      email: string;
      phone: string;
      branch: string;
      homeLandmark: string;
    }
  ) => {
    setDoc(doc(db, "users", uid), {
      name: data.name,
      email: data.email,
      phone: data.phone,
      branch: data.branch,
      homeLandmark: data.homeLandmark,
      pace: "",
      preferredDistance: "",
      emergencyContact: "",
      isMember: false,
      role: "member",
      createdAt: serverTimestamp(),
    }).catch((err) => {
      console.warn("Firestore save skipped (offline):", err);
    });
  };

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name.trim();
  const cleanPhone = phone.trim();

  if (!cleanName) {
    toast.error("Please enter your full name");
    return;
  }

  if (!cleanEmail || !cleanEmail.includes("@") || !cleanEmail.includes(".")) {
    toast.error("Please enter a valid email address");
    return;
  }

  if (!cleanPhone) {
    toast.error("Please enter your phone number");
    return;
  }

  if (!branch) {
    toast.error("Please select your club branch");
    return;
  }

  if (password !== confirmPassword) {
    toast.error("Passwords do not match");
    return;
  }

  if (password.length < 6) {
    toast.error("Password must be at least 6 characters");
    return;
  }

  setLoading(true);
  try {
   const { user } = await createUserWithEmailAndPassword(
  auth,
  cleanEmail,
  password
);
await updateProfile(user, { displayName: cleanName });

// Wait a moment so Auth token is ready for Firestore rules
await user.getIdToken(true);

try {
  await setDoc(doc(db, "users", user.uid), {
    name: cleanName,
    email: cleanEmail,
    phone: cleanPhone,
    branch,
    homeLandmark: homeLandmark.trim(),
    pace: "",
    preferredDistance: "",
    emergencyContact: "",
    isMember: false,
    role: "member",
    createdAt: serverTimestamp(),
  });
  console.log("User doc created:", user.uid);
} catch (err) {
  console.error("Firestore setDoc failed:", err);
  toast.error("Account created, but profile data failed to save");
}

toast.success("Account created successfully!");
router.push("/dashboard");
    await updateProfile(user, { displayName: cleanName });

    saveUserDocInBackground(user.uid, {
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      branch,
      homeLandmark: homeLandmark.trim(),
    });

    toast.success("Account created successfully!");
    router.push("/dashboard");
  } catch (err: any) {
    console.error(err);
    const msg =
      err?.code === "auth/email-already-in-use"
        ? "This email is already registered"
        : err?.code === "auth/invalid-email"
          ? "Invalid email address"
          : err?.message || "Registration failed";
    toast.error(msg);
  } finally {
    setLoading(false);
  }
};

  const handleGoogle = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const { user } = await signInWithPopup(auth, provider);

      saveUserDocInBackground(user.uid, {
        name: user.displayName || "Runner",
        email: user.email || "",
        phone: "",
        branch: "",
        homeLandmark: "",
      });

      toast.success("Signed in with Google!");
      router.push("/dashboard");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Google sign-up failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            Join <span className="text-orange-600">Ẹ̀RC</span>
          </h1>
          <p className="mt-2 text-muted-foreground">
            Create your Ẹ̀ko runners Club account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Full name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="John Doe"
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              Phone number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              placeholder="+234 801 234 5678"
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500"
            />
          </div>

          {/* Club branch */}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Club branch
            </label>
            <select
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              required
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500"
            >
              <option value="">Select your branch</option>
              {CLUB_BRANCHES.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Home landmark */}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Home landmark / bus stop
            </label>
            <input
              type="text"
              value={homeLandmark}
              onChange={(e) => setHomeLandmark(e.target.value)}
              placeholder="e.g. Jakande gate, CMS, Under bridge"
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Nearest landmark or bus stop to where you live
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="••••••••"
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              Confirm password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              placeholder="••••••••"
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-lg bg-orange-600 hover:bg-orange-600 text-white font-medium transition disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGoogle}
          disabled={loading}
          className="w-full h-11 rounded-lg border border-input bg-background hover:bg-muted font-medium transition disabled:opacity-50"
        >
          Continue with Google
        </button>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-orange-600 font-medium hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}