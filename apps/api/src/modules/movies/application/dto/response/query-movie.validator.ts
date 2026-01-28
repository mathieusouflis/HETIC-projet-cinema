import type z from "zod";
import { createPaginatedResponse } from "../../../../../shared/schemas/base/response.schemas.js";
import { movieSchema } from "../../schema/movies.schema.js";

export const queryMovieResponseSchema = createPaginatedResponse(movieSchema);

export type QueryMovieResponse = z.infer<typeof queryMovieResponseSchema>;
