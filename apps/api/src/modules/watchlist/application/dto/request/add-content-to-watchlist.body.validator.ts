import z from "zod";
import { uuidSchema } from "../../../../../shared/schemas/fields/uuid.schema";
import { watchlistStatusSchema } from "../../validators/watchlist.validators";

export const addContentToWatchlistBodyValidator = z.object({
  contentId: uuidSchema,
  status: watchlistStatusSchema.optional(),
  currentEpisode: z.number().min(1).optional(),
  currentSeason: z.number().min(1).optional(),
  startedAt: z.coerce.date().optional(),
  completedAt: z.coerce.date().optional(),
});

export type AddContentToWatchlistBody = z.infer<
  typeof addContentToWatchlistBodyValidator
>;
