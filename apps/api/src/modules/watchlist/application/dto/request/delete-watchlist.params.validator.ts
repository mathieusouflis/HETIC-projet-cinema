import z from "zod";
import { uuidSchema } from "../../../../../shared/schemas/fields";

export const deleteWatchlistParamsValidator = z.object({
  id: uuidSchema,
});

export type DeleteWatchlistParams = z.infer<
  typeof deleteWatchlistParamsValidator
>;
