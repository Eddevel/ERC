import { z } from "zod";

export const bookingSchema = z.object({
  tickets: z.coerce.number().min(1).max(5),
});

export type BookingInput = z.infer<typeof bookingSchema>;