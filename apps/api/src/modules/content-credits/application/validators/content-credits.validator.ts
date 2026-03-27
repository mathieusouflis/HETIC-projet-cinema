import { z } from "zod";
import { uuidSchema } from "../../../../shared/schemas/fields/uuid.schema";

export const contentCreditsValidator = z.object({
  id: uuidSchema,
  contentId: uuidSchema,
  personId: uuidSchema,
  role: z.string().max(50),
  characterName: z.string().max(255).min(1),
  orderIndex: z.number().min(0).max(100),
});
