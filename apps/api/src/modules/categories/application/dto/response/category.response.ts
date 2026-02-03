import { z } from "zod";
import { createPaginatedResponseSchema } from "../../../../../shared/schemas/base/response.schemas.js";
import { uuidSchema } from "../../../../../shared/schemas/fields/uuid.schema.js";
import { contentPlatformsValidator } from "../../../../content-platforms/application/validators/content-platforms.validator.js";
import { contentSchema } from "../../../../contents/application/schema/contents.schema.js";

export const categoryResponseSchema = z.object({
  id: uuidSchema,
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  createdAt: z.date(),
});

export const categoriesListResponseSchema = createPaginatedResponseSchema(
  categoryResponseSchema.extend({
    contentCategories: contentSchema.array().optional(),
    contentPlatforms: contentPlatformsValidator.array().optional(),
  })
);

z.object({
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
