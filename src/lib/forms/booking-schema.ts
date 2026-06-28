import { z } from "zod";

export const bookingSchema = z.object({
  name: z.string().trim().min(2, "Введите имя").max(100, "Слишком длинное имя").optional(),
  phone: z
    .string()
    .trim()
    .min(10, "Введите корректный номер телефона")
    .max(30, "Слишком длинный номер телефона"),
  eventDate: z.string().trim().optional(),
  guestCount: z.coerce.number().int().positive().max(1000).optional(),
  hallSlug: z.string().trim().optional(),
  message: z.string().trim().max(1200, "Слишком длинное сообщение").optional(),
  trap: z.string().max(0).optional()
});

export type BookingFormValues = z.infer<typeof bookingSchema>;
