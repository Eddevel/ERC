import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  increment,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Event, Booking, UserProfile } from "@/types";

// ========== EVENTS ==========
export async function getUpcomingEvents(limitCount = 20): Promise<Event[]> {
  const q = query(
    collection(db, "events"),
    orderBy("date", "asc"),
    limit(limitCount)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Event));
}

export async function getEvent(id: string): Promise<Event | null> {
  const snap = await getDoc(doc(db, "events", id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Event;
}

export async function createEvent(
  data: Omit<Event, "id" | "bookedCount" | "createdAt">
) {
  return addDoc(collection(db, "events"), {
    ...data,
    bookedCount: 0,
    createdAt: serverTimestamp(),
  });
}

// ========== BOOKINGS ==========
export async function getUserBookings(userId: string): Promise<Booking[]> {
  const q = query(
    collection(db, "bookings"),
    where("userId", "==", userId),
    orderBy("bookedAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Booking));
}

export async function hasUserBookedEvent(userId: string, eventId: string) {
  const q = query(
    collection(db, "bookings"),
    where("userId", "==", userId),
    where("eventId", "==", eventId),
    where("status", "==", "confirmed")
  );
  const snap = await getDocs(q);
  return !snap.empty;
}

export async function createBooking(
  userId: string,
  eventId: string,
  tickets: number
) {
  const alreadyBooked = await hasUserBookedEvent(userId, eventId);
  if (alreadyBooked) {
    throw new Error("You have already booked this event.");
  }

  const eventRef = doc(db, "events", eventId);
  const eventSnap = await getDoc(eventRef);
  if (!eventSnap.exists()) throw new Error("Event not found");

  const event = eventSnap.data() as Event;
  const available = event.capacity - event.bookedCount;
  if (tickets > available) {
    throw new Error(`Only ${available} spot(s) left.`);
  }

  const batch = writeBatch(db);

  const bookingRef = doc(collection(db, "bookings"));
  batch.set(bookingRef, {
    userId,
    eventId,
    tickets,
    status: "confirmed",
    bookedAt: serverTimestamp(),
  });

  batch.update(eventRef, {
    bookedCount: increment(tickets),
  });

  await batch.commit();
  return bookingRef.id;
}

// ========== USERS ==========

export async function markAsMember(uid: string, extra: Partial<UserProfile>) {
  await updateDoc(doc(db, "users", uid), {
    isMember: true,
    ...extra,
  });
}

export async function updateUserProfile(
  uid: string,
  data: Partial<UserProfile>
) {
  try {
    await updateDoc(doc(db, "users", uid), data);
  } catch (error: any) {
    console.error("updateUserProfile error:", error?.code, error?.message);
    throw error; // let the page show a toast
  }
  }