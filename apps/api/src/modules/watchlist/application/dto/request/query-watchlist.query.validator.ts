import z from "zod";
import { optionalOffsetAndPagePaginationQuerySchema } from "../../../../../shared/schemas/base/pagination.schema.js";
import { watchlistStatusSchema } from "../../validators/watchlist.validators";

export const queryWatchlistValidator = z.object({
  status: watchlistStatusSchema.optional(),
  ...optionalOffsetAndPagePaginationQuerySchema.shape,
});

export type QueryWatchlistRequest = z.infer<typeof queryWatchlistValidator>;
