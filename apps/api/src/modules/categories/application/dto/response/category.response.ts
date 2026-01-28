import { z } from "zod";
import { uuidSchema } from "../../../../../shared/schemas/fields/uuid.schema.js";

export const categoryResponseSchema = z.object({
  id: uuidSchema,
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  createdAt: z.date(),
});

export const categoriesListResponseSchema = z.object({
  categories: z.array(categoryResponseSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

export type CategoryResponseDTO = z.infer<typeof categoryResponseSchema>;
export type CategoriesListResponseDTO = z.infer<
  typeof categoriesListResponseSchema
>;
