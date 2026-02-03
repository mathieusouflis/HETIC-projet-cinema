import type z from "zod";
import { createPaginatedResponseSchema } from "../../../../../shared/schemas/base/response.schemas.js";
import { categoryResponseSchema } from "../../../../categories/application/dto/response/category.response.js";
import { platformValidator } from "../../../../platforms/application/validators/platforms.validator.js";
import { contentSchema } from "../../schema/contents.schema.js";

export const queryContentResponseSchema = createPaginatedResponseSchema(
  contentSchema.extend({
    contentCategories: categoryResponseSchema.array().optional(),
    contentPlatforms: platformValidator.optional(),
  })
);

export type QueryContentResponse = z.infer<typeof queryContentResponseSchema>;
