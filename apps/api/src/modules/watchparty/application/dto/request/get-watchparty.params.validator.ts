import z from "zod";
import { uuidSchema } from "../../../../../shared/schemas/fields/uuid.schema";

export const getWatchpartyParamsValidator = z.object({
  id: uuidSchema,
});

export type GetWatchpartyParams = z.infer<typeof getWatchpartyParamsValidator>;
