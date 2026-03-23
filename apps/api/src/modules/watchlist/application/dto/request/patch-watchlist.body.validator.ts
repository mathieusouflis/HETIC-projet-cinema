import z from "zod";
import { watchlistStatusSchema } from "../../validators/watchlist.validators";

export const patchWatchlistBodyValidator = z.object({
  status: watchlistStatusSchema,
  currentEpisode: z.number().min(1).optional(),
  currentSeason: z.number().min(1).optional(),
  startedAt: z.coerce.date().optional(),
  completedAt: z.coerce.date().optional(),
  rating: z.number().int().min(1).max(5).nullable().optional(),
});

export type PatchWatchlistBody = z.infer<typeof patchWatchlistBodyValidator>;
