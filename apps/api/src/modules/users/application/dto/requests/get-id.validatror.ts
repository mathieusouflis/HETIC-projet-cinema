import { z } from "zod";
import { uuidSchema } from "../../../../../shared/schemas/fields/uuid.schema";

export const getIdParamsSchema = z.object({
  id: uuidSchema
});

export type getIdParamsDTO = z.infer<typeof getIdParamsSchema>;
