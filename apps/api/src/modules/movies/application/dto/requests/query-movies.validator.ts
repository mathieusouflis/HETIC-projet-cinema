import z from "zod";
import { optionalFlexiblePaginationQuerySchema } from "../../../../../shared/services/pagination";

export const queryMovieRequestSchema = z.object({
  title: z.string().optional(),
  synopsis: z.string().optional(),
  releaseDate: z.date().optional(),
  year: z.number().optional(),
  averageRating: z.number().min(0).max(10).optional(),
  withCategories: z.enum(["true", "false"]).optional(),
  withPlatforms: z.enum(["true", "false"]).optional(),
  withCast: z.enum(["true", "false"]).optional(),
  ...optionalFlexiblePaginationQuerySchema.shape,
});

export type QueryMovieRequest = z.infer<typeof queryMovieRequestSchema>;
