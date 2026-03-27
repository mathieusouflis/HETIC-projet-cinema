import z from "zod";
import { uuidSchema } from "../../../../../shared/schemas/fields/uuid.schema";

export const getWatchlistByContentIdParamsValidator = z.object({
  id: uuidSchema,
});

export type GetWatchlistByContentIdParams = z.infer<
  typeof getWatchlistByContentIdParamsValidator
>;
