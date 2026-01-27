import z from "zod";
import { watchlistStatusSchema } from "../../validators/watchlist.validators";

export const queryWatchlistValidator = z.object({
  status: watchlistStatusSchema.optional(),
});

export type QueryWatchlistRequest = z.infer<typeof queryWatchlistValidator>;
