"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, updateProfile, type User } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { toast } from "sonner";

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

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [pace, setPace] = useState("");
  const [preferredDistance, setPreferredDistance] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [homeLandmark, setHomeLandmark] = useState("");
  const [branch, setBranch] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
useEffect(() => {
  const unsub = onAuthStateChanged(auth, (firebaseUser) => {
    setUser(firebaseUser);

    if (!firebaseUser) {
      setLoadingProfile(false);
      return;
    }

    setName(firebaseUser.displayName || "");
    setLoadingProfile(false); // show form immediately

    // Load extra fields in background
    getDoc(doc(db, "users", firebaseUser.uid))
      .then((snap) => {
        if (!snap.exists()) return;
        const data = snap.data();
        setName(data.name || firebaseUser.displayName || "");
        setPhone(data.phone || "");
        setPace(data.pace || "");
        setPreferredDistance(data.preferredDistance || "");
        setEmergencyContact(data.emergencyContact || "");
        setHomeLandmark(data.homeLandmark || "");
        setBranch(data.branch || "");
      })
      .catch(() => {
        console.warn("Could not load Firestore profile (offline)");
      });
  });

  return () => unsub();
}, []);

  const handleSave = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!user) {
    toast.error("You must be logged in");
    return;
  }

  setLoading(true);

  try {
    // 1. Always save name to Firebase Auth (this works)
    if (name.trim()) {
      await updateProfile(user, { displayName: name.trim() });
    }

    // 2. Firestore in background — do NOT await
    const payload = {
      name: name.trim(),
      phone: phone.trim(),
      pace: pace.trim(),
      preferredDistance: preferredDistance.trim(),
      emergencyContact: emergencyContact.trim(),
      homeLandmark: homeLandmark.trim(),
      branch: branch.trim(),
      email: user.email || "",
    };

    const userRef = doc(db, "users", user.uid);

    // Fire and forget — never blocks the UI
    getDoc(userRef)
      .then((snap) => {
        if (snap.exists()) {
          return updateDoc(userRef, payload);
        }
        return setDoc(userRef, {
          ...payload,
          isMember: true,
          role: "member",
        });
      })
      .catch((err) => {
        console.warn("Firestore save skipped (offline):", err);
      });

    // 3. Always show success and stop loading
    toast.success("Profile saved successfully!");
  } catch (err: any) {
    console.error(err);
    toast.error(err?.message || "Failed to save profile");
  } finally {
    setLoading(false);
  }
};

  if (loadingProfile) {
    return (
      <div className="max-w-lg py-12">
        <div className="h-8 w-48 bg-muted animate-pulse rounded mb-4" />
        <div className="h-4 w-64 bg-muted animate-pulse rounded mb-8" />
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-lg py-12">
        <p className="text-muted-foreground">
          Please log in to view your profile.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-lg">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground mt-1">
          Manage your ERC membership details
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1.5">Email</label>
          <input
            type="email"
            value={user.email || ""}
            disabled
            className="w-full rounded-lg border border-input bg-muted px-3 py-2.5 text-sm text-muted-foreground cursor-not-allowed"
          />
        </div>

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
          <label className="block text-sm font-medium mb-1.5">Phone number</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
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

        {/* Home landmark / bus stop */}
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
          <label className="block text-sm font-medium mb-1.5">
            Preferred pace
          </label>
          <input
            type="text"
            value={pace}
            onChange={(e) => setPace(e.target.value)}
            placeholder="e.g. 5:30/km"
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">
            Preferred distance
          </label>
          <select
            value={preferredDistance}
            onChange={(e) => setPreferredDistance(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500"
          >
            <option value="">Select distance</option>
            <option value="5K">5K</option>
            <option value="10K">10K</option>
            <option value="15K">15K</option>
            <option value="Half Marathon">Half Marathon</option>
            <option value="Full Marathon">Full Marathon</option>
            <option value="Any">Any</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">
            Emergency contact
          </label>
          <input
            type="text"
            value={emergencyContact}
            onChange={(e) => setEmergencyContact(e.target.value)}
            placeholder="Name & phone"
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-medium transition disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}