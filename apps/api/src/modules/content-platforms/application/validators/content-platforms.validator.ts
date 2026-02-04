import { z } from "zod";
import { uuidSchema } from "../../../../shared/schemas/fields";

export const contentPlatformsValidator = z.object({
  contentId: uuidSchema,
  platformId: uuidSchema,
  key: z.string().min(1, "Key is required"),
});
