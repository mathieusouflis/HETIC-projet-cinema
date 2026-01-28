import type z from "zod";
import { createPaginatedResponse } from "../../../../../shared/schemas/base/response.schemas.js";
import { watchpartySchema } from "../../validators/watchparty.validators.js";

export const queryWatchpartiesResponseValidator =
  createPaginatedResponse(watchpartySchema);

export type QueryWatchpartiesResponse = z.infer<
  typeof queryWatchpartiesResponseValidator
>;
