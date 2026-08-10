import { z } from "zod";

export const eventSchema = z.object({
  title: z.string().min(3, "Title is required"),
  description: z.string().min(10, "Description is required"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  location: z.string().min(3, "Location is required"),
  distance: z.string().min(1, "Distance is required"),
  price: z.number().min(0, "Price must be 0 or more"),
  capacity: z.number().min(1, "Capacity must be at least 1"),
  imageUrl: z.string().url().optional().or(z.literal("")),
});

export type EventInput = z.infer<typeof eventSchema>;