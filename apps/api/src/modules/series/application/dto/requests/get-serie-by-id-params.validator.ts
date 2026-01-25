import z from "zod";
import { uuidSchema } from "../../../../../shared/schemas/fields";

export const getSerieByIdValidatorParams = z.object({
  id: uuidSchema
});

export type GetSerieByIdValidatorParams = z.infer<typeof getSerieByIdValidatorParams>;
