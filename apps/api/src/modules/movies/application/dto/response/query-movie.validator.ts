import type z from "zod";
import { createPaginatedResponse } from "../../../../../shared/schemas/base/response.schemas.js";
import { categoryResponseSchema } from "../../../../categories/application/dto/response/category.response.js";
import { movieSchema } from "../../schema/movies.schema.js";

export const queryMovieResponseSchema = createPaginatedResponse(
  movieSchema.extend({
    contentCategories: categoryResponseSchema.array().optional(),
  })
);

export type QueryMovieResponse = z.infer<typeof queryMovieResponseSchema>;
