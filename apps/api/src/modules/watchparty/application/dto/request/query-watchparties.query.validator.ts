import z from "zod";
import { optionalOffsetAndPagePaginationQuerySchema } from "../../../../../shared/schemas/base/pagination.schema.js";
import { uuidSchema } from "../../../../../shared/schemas/fields/index.js";
import { watchpartyStatusSchema } from "../../validators/watchparty.validators.js";

export const queryWatchpartiesValidator = z.object({
  status: watchpartyStatusSchema.optional(),
  isPublic: z.coerce.boolean().optional(),
  contentId: uuidSchema.optional(),
  ...optionalOffsetAndPagePaginationQuerySchema.shape,
});

export type QueryWatchpartiesRequest = z.infer<
  typeof queryWatchpartiesValidator
>;
