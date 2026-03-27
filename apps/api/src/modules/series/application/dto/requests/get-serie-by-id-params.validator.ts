import z from "zod";
import { uuidSchema } from "../../../../../shared/schemas/fields/uuid.schema";

export const getSerieByIdValidatorParams = z.object({
  id: uuidSchema,
});

export type GetSerieByIdValidatorParams = z.infer<
  typeof getSerieByIdValidatorParams
>;
