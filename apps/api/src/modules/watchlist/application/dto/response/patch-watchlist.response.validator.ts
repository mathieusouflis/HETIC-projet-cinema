import z from "zod";
import { watchlistSchema } from "../../validators/watchlist.validators";

export const patchWatchlistResponseValidator = watchlistSchema;
export type PatchWatchlistResponse = z.infer<typeof patchWatchlistResponseValidator>;
