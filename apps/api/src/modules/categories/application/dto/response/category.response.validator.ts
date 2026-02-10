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

export type CategoryResponse = z.infer<typeof categoryResponseSchema>;
export type CategoriesListResponse = z.infer<
  typeof categoriesListResponseSchema
>;
