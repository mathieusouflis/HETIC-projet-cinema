import z from "zod";
import { optionalOffsetAndPagePaginationQuerySchema } from "../../../../../shared/schemas/base/pagination.schema";

export const queryMovieRequestSchema = z.object({
  title: z.string().optional(),
  synopsis: z.string().optional(),
  releaseDate: z.date().optional(),
  year: z.number().optional(),
  averageRating: z.number().min(0).max(10).optional(),
  withCategory: z.enum(["true", "false"]).optional(),
  ...optionalOffsetAndPagePaginationQuerySchema.shape,
});

export type QueryMovieRequest = z.infer<typeof queryMovieRequestSchema>;
