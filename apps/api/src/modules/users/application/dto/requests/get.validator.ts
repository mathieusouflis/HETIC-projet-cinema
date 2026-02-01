import type z from "zod";
import { optionalFlexiblePaginationQuerySchema } from "../../../../../shared/services/pagination";

export const getQuerySchema = optionalFlexiblePaginationQuerySchema;

export type GetQueryDTO = z.infer<typeof getQuerySchema>;
