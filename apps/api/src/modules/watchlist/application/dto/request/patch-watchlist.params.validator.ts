import z from "zod";
import { uuidSchema } from "../../../../../shared/schemas/fields";

export const patchWatchlistParamsValidator = z.object({
  id: uuidSchema,
});

export type PatchWatchlistParams = z.infer<
  typeof patchWatchlistParamsValidator
>;
