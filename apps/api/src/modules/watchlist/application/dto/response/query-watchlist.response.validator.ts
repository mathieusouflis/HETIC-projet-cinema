import type z from "zod";
import { createPaginatedResponseSchema } from "../../../../../shared/schemas/base/response.schemas.js";
import { watchlistSchema } from "../../validators/watchlist.validators.js";

export const queryWatchlistResponseValidator =
  createPaginatedResponseSchema(watchlistSchema);

export type QueryWatchlistResponse = z.infer<
  typeof queryWatchlistResponseValidator
>;
