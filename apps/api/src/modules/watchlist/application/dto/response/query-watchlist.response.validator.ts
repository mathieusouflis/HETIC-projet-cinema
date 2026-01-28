import type z from "zod";
import { createPaginatedResponse } from "../../../../../shared/schemas/base/response.schemas.js";
import { watchlistSchema } from "../../validators/watchlist.validators.js";

export const queryWatchlistResponseValidator =
  createPaginatedResponse(watchlistSchema);

export type QueryWatchlistResponse = z.infer<
  typeof queryWatchlistResponseValidator
>;
