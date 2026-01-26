import z from "zod";
import { uuidSchema } from "../../../../../shared/schemas/fields";

export const getWatchlistByIdParamsValidator = z.object({
  id: uuidSchema
})

export type GetWatchlistByIdParams = z.infer<typeof getWatchlistByIdParamsValidator>;
