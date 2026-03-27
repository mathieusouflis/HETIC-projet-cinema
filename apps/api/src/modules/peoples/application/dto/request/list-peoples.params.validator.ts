import z from "zod";
import { optionalFlexiblePaginationQuerySchema } from "../../../../../shared/services/pagination/pagination.schemas";

export const listPeoplesParamsValidator = z.object({
  nationality: z.string().optional(),
  name: z.string().optional(),
  ...optionalFlexiblePaginationQuerySchema.shape,
});

export type ListPeoplesParams = z.infer<typeof listPeoplesParamsValidator>;
