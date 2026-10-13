import { z } from "zod";

export const RESOURCE_TYPES = ["room", "equipment", "vehicle", "other"] as const;

export const resourceSchema = z.object({
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
    type: z.enum(RESOURCE_TYPES, { message: "Choose a resource type" }),
    description: z.string().trim().max(500).optional(),
    capacity: z.preprocess(
        (v) => (v === "" || v === null ? undefined : v),
        z.coerce.number().int().positive("Capacity must be at least 1").optional(),
    ),
});

export type ResourceInput = z.infer<typeof resourceSchema>;