export type UserRole = "member" | "admin" | "agent";

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
  expiresAt?: string | null;
  eventTitle?: string;
  scannedBy?: string | null;
scannedByName?: string | null;
usedAt?: string | { seconds: number } | null;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category?: string;
  stock: number;
  active: boolean;
  createdAt?: string | { seconds: number };
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address?: string;
  userId?: string | null;
  paymentRef?: string;
  createdAt: string;
}

export type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
}

export interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address?: string;
  userId?: string | null;
  status: OrderStatus;
  paymentRef?: string;
  createdAt: string;
  updatedAt?: string;
}


