import type z from "zod";
import { createPaginatedResponse } from "../../../../../shared/schemas/base/response.schemas.js";
import { contentSchema } from "../../schema/contents.schema.js";

export const searchContentsResponseSchema =
  createPaginatedResponse(contentSchema);

export type SearchContentsResponse = z.infer<
  typeof searchContentsResponseSchema
>;
