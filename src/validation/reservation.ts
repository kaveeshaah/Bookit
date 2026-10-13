import { z } from "zod";

// Organisation is in Sri Lanka (UTC+05:30, no daylight saving).
// datetime-local inputs have no time zone, so we pin them to it.
const localDateTime = z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "Enter a valid date and time")
    .transform((v) => new Date(`${v}:00+05:30`))
    .refine((d) => !isNaN(d.getTime()), "Enter a valid date and time");

export const reservationSchema = z
    .object({
        resource_id: z.coerce.number().int().positive("Choose a resource"),
        user_id: z.coerce.number().int().positive("Choose who is booking"),
        title: z.string().trim().min(2, "Add a short purpose").max(150),
        start_time: localDateTime,
        end_time: localDateTime,
    })
    .refine((d) => d.end_time > d.start_time, {
        message: "End time must be after the start time",
        path: ["end_time"],
    })
    .refine((d) => d.start_time > new Date(), {
        message: "Start time must be in the future",
        path: ["start_time"],
    });

export type ReservationInput = z.infer<typeof reservationSchema>;