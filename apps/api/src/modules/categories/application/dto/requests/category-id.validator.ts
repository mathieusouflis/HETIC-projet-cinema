import { z } from "zod";
import { uuidSchema } from "../../../../../shared/schemas/fields/uuid.schema.js";

export const categoryIdParamsSchema = z.object({
  id: uuidSchema,
});

export type CategoryIdParamsDTO = z.infer<typeof categoryIdParamsSchema>;
