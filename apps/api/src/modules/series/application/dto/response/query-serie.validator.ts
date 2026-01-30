import type z from "zod";
import { createPaginatedResponseSchema } from "../../../../../shared/schemas/base/response.schemas.js";
import { categoryResponseSchema } from "../../../../categories/application/dto/response/category.response.js";
import { serieSchema } from "../../schema/series.schema.js";

export const querySerieResponseSchema = createPaginatedResponseSchema(
  serieSchema.extend({
    contentCategories: categoryResponseSchema.array().optional(),
  })
);

export type QuerySerieResponse = z.infer<typeof querySerieResponseSchema>;
