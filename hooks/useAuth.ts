"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import type { UserProfile } from "@/types";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (!firebaseUser) {
        setProfile(null);
        setLoading(false);
        return;
      }

      // Default until Firestore responds
      const basic: UserProfile = {
        uid: firebaseUser.uid,
        name: firebaseUser.displayName || "Runner",
        email: firebaseUser.email || "",
        phone: "",
        pace: "",
        preferredDistance: "",
        isMember: true,
        role: "member",
        createdAt: new Date().toISOString(),
        photoURL: firebaseUser.photoURL || undefined,
      };

      try {
        const snap = await getDoc(doc(db, "users", firebaseUser.uid));
        if (snap.exists()) {
          const data = snap.data();
         setProfile({
  ...basic,
  name: data.name || basic.name,
  email: data.email || basic.email,
  phone: data.phone || "",
  pace: data.pace || "",
  preferredDistance: data.preferredDistance || "",
  emergencyContact: data.emergencyContact || "",
  homeLandmark: data.homeLandmark || "",
  branch: data.branch || "",
  isMember: data.isMember ?? true,
  role:
    data.role === "admin"
      ? "admin"
      : data.role === "agent"
        ? "agent"
        : "member",
});
        } else {
          setProfile(basic);
        }
      } catch (err) {
        console.warn("Profile load failed, using basic profile", err);
        setProfile(basic);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);


  return {
  user,
  profile,
  loading,
  isAdmin: profile?.role === "admin",
  isAgent: profile?.role === "agent",
  // scan allowed for admin OR agent
  canScan: profile?.role === "admin" || profile?.role === "agent",
  canManageEvents: profile?.role === "admin",
};
}