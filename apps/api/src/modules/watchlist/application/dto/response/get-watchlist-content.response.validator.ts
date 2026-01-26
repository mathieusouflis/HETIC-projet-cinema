import z from "zod";
import { watchlistSchema } from "../../validators/watchlist.validators";

export const getWatchlistByContentIdResponseValidator = watchlistSchema;
export type GetWatchlistByContentIdResponse = z.infer<typeof getWatchlistByContentIdResponseValidator>;
