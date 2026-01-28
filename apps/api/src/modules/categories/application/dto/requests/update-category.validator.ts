import { z } from "zod";
import { uuidSchema } from "../../../../../shared/schemas/fields/uuid.schema.js";

export const updateCategoryParamsSchema = z.object({
  id: uuidSchema,
});

export const updateCategoryBodySchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters")
    .trim()
    .optional(),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(100, "Slug must be at most 100 characters")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format")
    .optional(),
  description: z
    .string()
    .max(500, "Description must be at most 500 characters")
    .optional()
    .nullable(),
});

export type UpdateCategoryDTO = z.infer<typeof updateCategoryBodySchema>;
