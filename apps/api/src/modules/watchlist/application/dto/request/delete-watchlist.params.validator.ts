import z from "zod";
import { uuidSchema } from "../../../../../shared/schemas/fields/uuid.schema";

export const deleteWatchlistParamsValidator = z.object({
  id: uuidSchema,
});

export type DeleteWatchlistParams = z.infer<
  typeof deleteWatchlistParamsValidator
>;
