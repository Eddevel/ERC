import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  confirmPasswordReset,
  verifyPasswordResetCode,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
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

function mapRole(role: unknown): UserProfile["role"] {
  if (role === "admin") return "admin";
  if (role === "agent") return "agent";
  return "member";
}

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
  try {
    const snap = await getDoc(doc(db, "users", uid));
    if (!snap.exists()) return null;

    const data = snap.data() as DocumentData;

    return {
      uid,
      name: data.name || "",
      email: data.email || "",
      phone: data.phone || "",
      pace: data.pace || "",
      preferredDistance: data.preferredDistance || "",
      emergencyContact: data.emergencyContact || "",
      homeLandmark: data.homeLandmark || "",
      branch: data.branch || "",
      isMember: data.isMember ?? false,
      role: mapRole(data.role),
      photoURL: data.photoURL || undefined,
      createdAt:
        data.createdAt?.toDate?.()?.toISOString?.() ||
        data.createdAt ||
        new Date().toISOString(),
    } as UserProfile;
  } catch (err) {
    console.warn("getUserProfile error:", err);
    return null;
  }
}

/** Password reset request — same UI message whether email exists or not */
export async function requestPasswordReset(email: string) {
  const trimmed = email.trim().toLowerCase();
  if (!trimmed || !trimmed.includes("@")) {
    throw new Error("Enter a valid email address");
  }

  try {
    await sendPasswordResetEmail(auth, trimmed, {
      url: `${typeof window !== "undefined" ? window.location.origin : ""}/login`,
      handleCodeInApp: false,
    });
  } catch (err: any) {
    const code = err?.code as string | undefined;

    if (code === "auth/user-not-found" || code === "auth/invalid-email") {
      return { ok: true as const };
    }
    if (code === "auth/too-many-requests") {
      throw new Error("Too many attempts. Please try again later.");
    }

    console.error("reset error", err);
    throw new Error("Could not send reset email. Try again later.");
  }

  return { ok: true as const };
}

export async function completePasswordReset(
  oobCode: string,
  newPassword: string
) {
  if (!oobCode) throw new Error("Invalid or missing reset code");
  if (newPassword.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }

  await verifyPasswordResetCode(auth, oobCode);
  await confirmPasswordReset(auth, oobCode, newPassword);
}

/** Change password while logged in (email/password accounts only) */
export async function changePassword(
  user: User,
  currentPassword: string,
  newPassword: string
) {
  if (!user.email) throw new Error("No email on this account");
  if (newPassword.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }

  const credential = EmailAuthProvider.credential(
    user.email,
    currentPassword
  );
  await reauthenticateWithCredential(user, credential);
  await updatePassword(user, newPassword);
}