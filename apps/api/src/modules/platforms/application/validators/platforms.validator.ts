import { z } from "zod";
import { uuidSchema } from "../../../../shared/schemas/fields";

export const platformValidator = z.object({
  id: uuidSchema,
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(100, "Slug is too long")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be lowercase with hyphens only"
    ),
  logoUrl: z.string().url("Invalid logo URL").nullable(),
  baseUrl: z.string().url("Invalid base URL").nullable(),
  isSupported: z.boolean().default(true).nullable(),
  createdAt: z.coerce.date().or(z.string().datetime()).nullable(),
});
