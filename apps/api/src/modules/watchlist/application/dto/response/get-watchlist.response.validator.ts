import z from "zod";
import { watchlistSchema } from "../../validators/watchlist.validators";

export const getWatchlistByIdResponseValidator = watchlistSchema;
export type GetWatchlistByIdResponse = z.infer<typeof getWatchlistByIdResponseValidator>;
