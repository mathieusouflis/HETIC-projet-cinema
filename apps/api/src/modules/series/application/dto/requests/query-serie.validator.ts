import z from "zod";
import { optionalFlexiblePaginationQuerySchema } from "../../../../../shared/services/pagination";

export const querySerieRequestSchema = z.object({
  title: z.string().optional(),
  synopsis: z.string().optional(),
  releaseDate: z.date().optional(),
  year: z.number().optional(),
  averageRating: z.number().min(0).max(10).optional(),
  withCategories: z.enum(["true", "false"]).optional(),
  withPlatforms: z.enum(["true", "false"]).optional(),
  withCast: z.enum(["true", "false"]).optional(),
  withSeasons: z.enum(["true", "false"]).optional(),
  withEpisodes: z.enum(["true", "false"]).optional(),
  seasonNumber: z.string().uuid().optional(),
  episodeNumber: z.string().uuid().optional(),
  ...optionalFlexiblePaginationQuerySchema.shape,
});

export type QuerySerieRequest = z.infer<typeof querySerieRequestSchema>;
