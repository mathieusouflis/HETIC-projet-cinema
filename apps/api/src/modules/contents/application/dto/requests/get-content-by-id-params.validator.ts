import z from "zod";
import { uuidSchema } from "../../../../../shared/schemas/fields/uuid.schema";

export const getContentByIdValidatorParams = z.object({
  id: uuidSchema,
});

export type GetContentByIdValidatorParams = z.infer<
  typeof getContentByIdValidatorParams
>;
