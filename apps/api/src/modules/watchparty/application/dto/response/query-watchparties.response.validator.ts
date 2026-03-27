import type z from "zod";
import { createPaginatedResponseSchema } from "../../../../../shared/schemas/base/response.schemas";
import { watchpartySchema } from "../../validators/watchparty.validators";

export const queryWatchpartiesResponseValidator =
  createPaginatedResponseSchema(watchpartySchema);

export type QueryWatchpartiesResponse = z.infer<
  typeof queryWatchpartiesResponseValidator
>;
