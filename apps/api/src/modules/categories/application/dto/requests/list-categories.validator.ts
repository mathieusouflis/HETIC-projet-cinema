import z from "zod";
import { optionalOffsetAndPagePaginationQuerySchema } from "../../../../../shared/schemas/base/pagination.schema.js";

export const listCategoriesQuerySchema = z.object({
  withContent: z.enum(["true", "false"]).optional(),
  ...optionalOffsetAndPagePaginationQuerySchema.shape,
});

export type ListCategoriesQueryDTO = z.infer<typeof listCategoriesQuerySchema>;
