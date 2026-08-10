import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  type DocumentData,
} from "firebase/firestore";
import { auth, db } from "./firebase";
import type { UserProfile } from "@/types";

const googleProvider = new GoogleAuthProvider();

export async function registerWithEmail(
  email: string,
  password: string,
  name: string
): Promise<User> {
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(user, { displayName: name });

  try {
    await setDoc(doc(db, "users", user.uid), {
      name,
      email,
      phone: "",
      pace: "",
      preferredDistance: "",
      isMember: false,
      role: "member",
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn("Could not save profile to Firestore:", err);
  }

  return user;
}

export async function loginWithEmail(
  email: string,
  password: string
): Promise<User> {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
}

export async function loginWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;

  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    await setDoc(userRef, {
      name: user.displayName || "Runner",
      email: user.email,
      phone: "",
      pace: "",
      preferredDistance: "",
      isMember: false,
      role: "member",
      photoURL: user.photoURL || null,
      createdAt: serverTimestamp(),
    });
  }

  return user;
}

export async function logout(): Promise<void> {
  await signOut(auth);
}

export async function getUserProfile(
  uid: string
): Promise<UserProfile | null> {
  // Temporarily disabled — Firestore is offline
  return null;
}