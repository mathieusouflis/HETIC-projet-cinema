import type z from "zod";
import { watchlistSchema } from "../../validators/watchlist.validators";

export const addWatchlistContentResponseValidator = watchlistSchema;

export type AddWatchlistContentResponse = z.infer<
  typeof addWatchlistContentResponseValidator
>;
