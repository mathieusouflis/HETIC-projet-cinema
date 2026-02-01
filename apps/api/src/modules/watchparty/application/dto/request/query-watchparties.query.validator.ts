import z from "zod";
import { uuidSchema } from "../../../../../shared/schemas/fields/index.js";
import { optionalFlexiblePaginationQuerySchema } from "../../../../../shared/services/pagination";
import { watchpartyStatusSchema } from "../../validators/watchparty.validators.js";

export const queryWatchpartiesValidator = z.object({
  status: watchpartyStatusSchema.optional(),
  isPublic: z.coerce.boolean().optional(),
  contentId: uuidSchema.optional(),
  ...optionalFlexiblePaginationQuerySchema.shape,
});

export type QueryWatchpartiesRequest = z.infer<
  typeof queryWatchpartiesValidator
>;
