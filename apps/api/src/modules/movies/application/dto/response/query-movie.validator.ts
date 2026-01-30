import type z from "zod";
import { createPaginatedResponseSchema } from "../../../../../shared/schemas/base/response.schemas.js";
import { categoryResponseSchema } from "../../../../categories/application/dto/response/category.response.js";
import { movieSchema } from "../../schema/movies.schema.js";

export const queryMovieResponseSchema = createPaginatedResponseSchema(
  movieSchema.extend({
    contentCategories: categoryResponseSchema.array().optional(),
  })
);

export type QueryMovieResponse = z.infer<typeof queryMovieResponseSchema>;
