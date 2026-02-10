import type z from "zod";
import { createPaginatedResponseSchema } from "../../../../../shared/schemas/base/response.schemas.js";
import { categoryResponseSchema } from "../../../../categories/application/dto/response/category.response.validator.js";
import { peopleValidator } from "../../../../peoples/application/validators/people.validator.js";
import { platformValidator } from "../../../../platforms/application/validators/platforms.validator.js";
import { seasonValidator } from "../../../../seasons/application/validators/seasons.validator.js";
import { movieSchema } from "../../schema/movies.schema.js";

export const queryMovieResponseSchema = createPaginatedResponseSchema(
  movieSchema.extend({
    contentCategories: categoryResponseSchema.array().optional(),
    contentPlatforms: platformValidator.array().optional(),
    contentCredits: peopleValidator.array().optional(),
    seasons: seasonValidator.array().optional(),
  })
);

export type QueryMovieResponse = z.infer<typeof queryMovieResponseSchema>;
