import z from "zod";
import { uuidSchema } from "../../../../../shared/schemas/fields/uuid.schema";
import { optionalFlexiblePaginationQuerySchema } from "../../../../../shared/services/pagination/pagination.schemas";
import { watchpartyStatusSchema } from "../../validators/watchparty.validators";

export const queryWatchpartiesValidator = z.object({
  status: watchpartyStatusSchema.optional(),
  isPublic: z.coerce.boolean().optional(),
  contentId: uuidSchema.optional(),
  ...optionalFlexiblePaginationQuerySchema.shape,
});

export type QueryWatchpartiesRequest = z.infer<
  typeof queryWatchpartiesValidator
>;
