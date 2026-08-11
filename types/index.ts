export type UserRole = "member" | "admin";

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone: string;
  pace: string;
  preferredDistance: string;
  emergencyContact?: string;
  homeLandmark?: string;
  branch?: string;
  isMember: boolean;
  role: UserRole;
  createdAt: Date | string;
  photoURL?: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  distance: string;
  price: number;
  capacity: number;
  bookedCount: number;
  imageUrl?: string;
  createdAt: Date | string;
}

export interface Booking {
  id: string;
  userId: string;
  eventId: string;
  tickets: number;
  status: "confirmed" | "cancelled";
  bookedAt: Date | string;
  event?: Event;
}

export interface Ticket {
  id: string;
  userId: string;
  eventId: string;
  userName: string;
  userEmail: string;
  amountPaid: number;
  quantity?: number;
  status: "valid" | "used" | "cancelled" | "expired";
  paymentRef: string;
  paidAt: string;
  usedAt?: string | null;
  expiresAt?: string | null;
  eventTitle?: string;
  scannedBy?: string | null;
}