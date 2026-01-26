import z from "zod";
import { uuidSchema } from "../../../../../shared/schemas/fields";
import { watchlistStatusSchema } from "../../validators/watchlist.validators";

export const addContentToWatchlistBodyValidator = z.object({
  contentId: uuidSchema,
  status: watchlistStatusSchema.optional(),
  currentEpisode: z.number().min(1).optional(),
  currentSeason: z.number().min(1).optional(),
  startedAt: z.date().optional(),
  completedAt: z.date().optional(),

})

export type AddContentToWatchlistBody = z.infer<typeof addContentToWatchlistBodyValidator>;
