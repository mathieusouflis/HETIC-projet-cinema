import type z from "zod";
import { createPaginatedResponseSchema } from "../../../../../shared/schemas/base/response.schemas.js";
import { contentSchema } from "../../schema/contents.schema.js";

export const searchContentsResponseSchema =
  createPaginatedResponseSchema(contentSchema);

export type SearchContentsResponse = z.infer<
  typeof searchContentsResponseSchema
>;
