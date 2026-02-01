import z from "zod";
import { optionalFlexiblePaginationQuerySchema } from "../../../../../shared/services/pagination";
import { watchlistStatusSchema } from "../../validators/watchlist.validators";

export const queryWatchlistValidator = z.object({
  status: watchlistStatusSchema.optional(),
  ...optionalFlexiblePaginationQuerySchema.shape,
});

export type QueryWatchlistRequest = z.infer<typeof queryWatchlistValidator>;
