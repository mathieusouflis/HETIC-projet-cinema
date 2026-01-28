import z from "zod";
import { uuidSchema } from "../../../../../shared/schemas/fields";

export const getWatchlistByContentIdParamsValidator = z.object({
  id: uuidSchema,
});

export type GetWatchlistByContentIdParams = z.infer<
  typeof getWatchlistByContentIdParamsValidator
>;
