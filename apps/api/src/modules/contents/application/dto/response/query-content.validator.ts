import type z from "zod";
import { createPaginatedResponse } from "../../../../../shared/schemas/base/response.schemas.js";
import { categoryResponseSchema } from "../../../../categories/application/dto/response/category.response.js";
import { contentSchema } from "../../schema/contents.schema.js";

export const queryContentResponseSchema = createPaginatedResponse(
  contentSchema.extend({
    contentCategories: categoryResponseSchema.array().optional(),
  })
);

export type QueryContentResponse = z.infer<typeof queryContentResponseSchema>;
