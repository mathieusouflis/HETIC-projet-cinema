import z from "zod";
import { uuidSchema } from "../../../../../shared/schemas/fields/uuid.schema";

export const deleteWatchpartyParamsValidator = z.object({
  id: uuidSchema,
});

export type DeleteWatchpartyParams = z.infer<
  typeof deleteWatchpartyParamsValidator
>;
