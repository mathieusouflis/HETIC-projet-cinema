import z from "zod";
import { uuidSchema } from "../../../../shared/schemas/fields";
import type { WatchStatus } from "../../domain/entities/watchlist.entity";

export const watchlistStatusSchema = z.enum<WatchStatus[]>([
  "completed",
  "dropped",
  "not_interested",
  "plan_to_watch",
  "undecided",
  "watching",
]);

export const watchlistSchema = z.object({
  id: uuidSchema,
  userId: uuidSchema,
  contentId: uuidSchema,
  status: watchlistStatusSchema,
  currentEpisode: z.number().min(1).nullable(),
  currentSeason: z.number().min(1).nullable(),
  addedAt: z.date(),
  startedAt: z.date().nullable(),
  completedAt: z.date().nullable(),
});
