import z from "zod";
import { uuidSchema } from "../../../../../shared/schemas/fields/index.js";
import { watchpartyStatusSchema } from "../../validators/watchparty.validators.js";

export const queryWatchpartiesValidator = z.object({
  status: watchpartyStatusSchema.optional(),
  isPublic: z.coerce.boolean().optional(),
  contentId: uuidSchema.optional(),
});

export type QueryWatchpartiesRequest = z.infer<typeof queryWatchpartiesValidator>;
