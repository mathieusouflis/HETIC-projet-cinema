import z from "zod";
import { optionalOffsetAndPagePaginationQuerySchema } from "../../../../../shared/schemas/base/pagination.schema";

export const getQuerySchema = optionalOffsetAndPagePaginationQuerySchema

export type GetQueryDTO = z.infer<typeof getQuerySchema>;
