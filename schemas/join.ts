import { z } from "zod";

export const joinSchema = z.object({
  name: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(10, "Valid phone number required"),
  preferredDistance: z.enum(["5K", "10K", "15K", "Half Marathon", "Full Marathon", "Any"]),
  pace: z.string().min(1, "Preferred pace is required"),
  emergencyContact: z.string().optional(),
});

export type JoinInput = z.infer<typeof joinSchema>;