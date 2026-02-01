import z from "zod";
import {
  limitSchema,
  pageSchema,
} from "../../../../../shared/services/pagination";

export const searchContentsRequestSchema = z.object({
  query: z.string().min(1, "Search query must not be empty"),
  type: z.enum(["movie", "serie"]).optional(),
  page: pageSchema,
  limit: limitSchema,
});

export type SearchContentsRequest = z.infer<typeof searchContentsRequestSchema>;
