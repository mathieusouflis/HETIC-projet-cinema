import z from "zod";
import { movieSchema } from "../../schema/movies.schema";

export const queryMovieResponseSchema = z.array(movieSchema)

export type QueryMovieResponse = z.infer<typeof queryMovieResponseSchema>;
