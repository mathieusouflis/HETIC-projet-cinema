import z from "zod"
import { optionalOffsetAndPagePaginationQuerySchema } from "../../../../../shared/schemas/base/pagination.schema"

export const queryContentRequestSchema = z.object({
  title: z.string().optional(),
  contentType: z.enum(["movie", "series"]).optional(),
  synopsis: z.string().optional(),
  releaseDate: z.date().optional(),
  year: z.number().optional(),
  averageRating: z.number().min(0).max(10).optional(),
  ...optionalOffsetAndPagePaginationQuerySchema.shape,
})

export type QueryContentRequest = z.infer<typeof queryContentRequestSchema>;
