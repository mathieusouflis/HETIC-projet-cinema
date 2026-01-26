
import z from "zod";
import { uuidSchema } from "../../../../../shared/schemas/fields";

export const patchWatchlistByContentIdParamsValidator = z.object({
  id: uuidSchema
})

export type PatchWatchlistByContentIdParams = z.infer<typeof patchWatchlistByContentIdParamsValidator>;
