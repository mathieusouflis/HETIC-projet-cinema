import z from "zod";
import { optionalOffsetAndPagePaginationQuerySchema } from "../../../../../shared/schemas/base/pagination.schema";

export const listPeoplesParamsValidator = z.object({
  nationality: z.string().optional(),
  name: z.string().optional(),
  ...optionalOffsetAndPagePaginationQuerySchema.shape,
});

export type ListPeoplesParams = z.infer<typeof listPeoplesParamsValidator>;
