import type z from "zod";
import { optionalOffsetAndPagePaginationQuerySchema } from "../../../../../shared/schemas/base/pagination.schema.js";

export const listCategoriesQuerySchema =
  optionalOffsetAndPagePaginationQuerySchema;

export type ListCategoriesQueryDTO = z.infer<typeof listCategoriesQuerySchema>;
