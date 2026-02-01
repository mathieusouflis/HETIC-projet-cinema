import z from "zod";
import { optionalFlexiblePaginationQuerySchema } from "../../../../../shared/services/pagination";

export const listCategoriesQuerySchema = z.object({
  withContent: z.enum(["true", "false"]).optional(),
  ...optionalFlexiblePaginationQuerySchema.shape,
});

export type ListCategoriesQueryDTO = z.infer<typeof listCategoriesQuerySchema>;
