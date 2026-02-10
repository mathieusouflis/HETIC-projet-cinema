import { z } from "zod";
import { uuidSchema } from "../../../../shared/schemas/fields/index.js";

export const seasonValidator = z.object({
  id: uuidSchema,
  seriesId: uuidSchema,
  name: z.string().nullable(),
  seasonNumber: z.number().int(),
  episodeCount: z.number().int().nullable(),
  overview: z.string().nullable(),
  posterUrl: z.string().url().nullable(),
  airDate: z.string().nullable(),
  tmdbId: z.number().int().nullable(),
});
