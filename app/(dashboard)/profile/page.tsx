"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, updateProfile, type User } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { changePassword } from "@/lib/auth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

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

  // Password change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  const isEmailUser = user?.providerData?.some(
    (p) => p.providerId === "password"
  );

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);

      if (!firebaseUser) {
        setLoadingProfile(false);
        return;
      }

      setName(firebaseUser.displayName || "");
      setLoadingProfile(false);

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
          console.warn("Could not load Firestore profile");
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
      if (name.trim()) {
        await updateProfile(user, { displayName: name.trim() });
      }

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
      const snap = await getDoc(userRef);

      if (snap.exists()) {
        await updateDoc(userRef, payload);
      } else {
        await setDoc(userRef, {
          ...payload,
          isMember: true,
          role: "member",
        });
      }

      toast.success("Profile saved successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setPwLoading(true);
    try {
      await changePassword(user, currentPassword, newPassword);
      toast.success("Password updated");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      const code = err?.code || "";
      if (
        code.includes("wrong-password") ||
        code.includes("invalid-credential")
      ) {
        toast.error("Current password is incorrect");
      } else {
        toast.error(err.message || "Could not update password");
      }
    } finally {
      setPwLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500";

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

      {/* Profile form */}
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
            className={inputClass}
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
            placeholder="+234 801 234 5678"
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">
            Club branch
          </label>
          <select
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            required
            className={inputClass}
          >
            <option value="">Select your branch</option>
            {CLUB_BRANCHES.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">
            Home landmark / bus stop
          </label>
          <input
            type="text"
            value={homeLandmark}
            onChange={(e) => setHomeLandmark(e.target.value)}
            placeholder="e.g. Jakande gate, CMS, Under bridge"
            className={inputClass}
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
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">
            Preferred distance
          </label>
          <select
            value={preferredDistance}
            onChange={(e) => setPreferredDistance(e.target.value)}
            className={inputClass}
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
            className={inputClass}
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

      {/* Separate form — not nested */}
      {isEmailUser ? (
        <form
          onSubmit={handleChangePassword}
          className="mt-10 space-y-4 border-t pt-8"
        >
          <h2 className="text-lg font-semibold">Change password</h2>
          <input
            type="password"
            placeholder="Current password"
            className={inputClass}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          <input
            type="password"
            placeholder="New password (min 8 characters)"
            className={inputClass}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
          />
          <input
            type="password"
            placeholder="Confirm new password"
            className={inputClass}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
          />
          <Button
            type="submit"
            disabled={pwLoading}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            {pwLoading ? "Updating..." : "Update password"}
          </Button>
        </form>
      ) : (
        <p className="mt-10 border-t pt-8 text-sm text-muted-foreground">
          You signed in with Google. Manage your password in your Google
          account.
        </p>
      )}
    </div>
  );
}