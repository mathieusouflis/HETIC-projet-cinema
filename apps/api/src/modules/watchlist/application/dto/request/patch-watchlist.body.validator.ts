import z from "zod";
import { watchlistStatusSchema } from "../../validators/watchlist.validators";

export const patchWatchlistBodyValidator = z.object({
  status: watchlistStatusSchema,
  currentEpisode: z.number().min(1).optional(),
  currentSeason: z.number().min(1).optional(),
  startedAt: z.date().optional(),
  completedAt: z.date().optional(),
});

export type PatchWatchlistBody = z.infer<typeof patchWatchlistBodyValidator>;
