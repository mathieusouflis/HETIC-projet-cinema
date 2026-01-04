import { z } from "zod";
import { uuidSchema } from "../../../../../shared/schemas/fields/uuid.schema";

export const deleteIdParamsSchema = z.object({
  id: uuidSchema
});
