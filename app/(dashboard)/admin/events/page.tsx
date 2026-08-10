"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";

export default function AdminEventsPage() {
  const { isAdmin, loading: authLoading, user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [distance, setDistance] = useState("");
  const [price, setPrice] = useState(0);
  const [capacity, setCapacity] = useState(50);
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!isAdmin) {
      toast.error("Admin access required");
      router.replace("/dashboard");
    }
  }, [authLoading, user, isAdmin, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !time || !location || !distance) {
      toast.error("Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "events"), {
        title: title.trim(),
        description: description.trim(),
        date,
        time,
        location: location.trim(),
        distance: distance.trim(),
        price: Number(price) || 0,
        capacity: Number(capacity) || 50,
        bookedCount: 0,
        imageUrl: imageUrl.trim() || null,
        createdAt: serverTimestamp(),
      });

      toast.success("Event created!");
      setTitle("");
      setDescription("");
      setDate("");
      setTime("");
      setLocation("");
      setDistance("");
      setPrice(0);
      setCapacity(50);
      setImageUrl("");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !isAdmin) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        Checking admin access...
      </div>
    );
  }

  const inputClass =
    "w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500";

  return (
    <div className="max-w-xl">
      <h1 className="text-3xl font-bold mb-2">Create Event</h1>
      <p className="text-muted-foreground mb-8">
        Add a new run for ERC members
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1.5">Title *</label>
          <input
            className={inputClass}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Saturday Morning 10K"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Description</label>
          <textarea
            className={inputClass}
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Route, pace groups, what to bring..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Date *</label>
            <input
              type="date"
              className={inputClass}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Time *</label>
            <input
              type="time"
              className={inputClass}
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Location *</label>
          <input
            className={inputClass}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
            placeholder="Lekki Conservation Centre"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Distance *</label>
          <input
            className={inputClass}
            value={distance}
            onChange={(e) => setDistance(e.target.value)}
            required
            placeholder="5K / 10K / 21K"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Price (₦) *
            </label>
            <input
              type="number"
              min={0}
              className={inputClass}
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Capacity *</label>
            <input
              type="number"
              min={1}
              className={inputClass}
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value))}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">
            Image URL (optional)
          </label>
          <input
            className={inputClass}
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://..."
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-medium disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Event"}
        </button>
      </form>
    </div>
  );
}