import z from "zod";
import { watchlistSchema } from "../../validators/watchlist.validators";

export const queryWatchlistResponseValidator = z.array(watchlistSchema);
export type QueryWatchlistResponse = z.infer<typeof queryWatchlistResponseValidator>;
