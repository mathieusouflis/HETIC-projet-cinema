import type z from "zod";
import { movieSchema } from "../../schema/movies.schema";

export const getMovieByIdResponseSchema = movieSchema;

export type GetMovieByIdResponse = z.infer<typeof getMovieByIdResponseSchema>;
