import z from "zod";
import { uuidSchema } from "../../../../../shared/schemas/fields/uuid.schema";

export const getWatchlistByIdParamsValidator = z.object({
  id: uuidSchema,
});

export type GetWatchlistByIdParams = z.infer<
  typeof getWatchlistByIdParamsValidator
>;
