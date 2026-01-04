import { z } from "zod";


export const pageSchema = z.coerce
  .number("Page must be a number")
  .int("Page must be an integer")
  .min(1, "Page must be at least 1")
  .default(1);

export const limitSchema = z.coerce
  .number("Limit must be a number")
  .int("Limit must be an integer")
  .min(1, "Limit must be at least 1")
  .max(100, "Limit must be at most 100")
  .default(25);

export const offsetSchema = z.coerce
  .number("Offset must be a number")
  .int("Offset must be an integer")
  .min(0, "Offset must be at least 0")
  .default(0);

export const sortDirectionSchema = z
  .enum(["asc", "desc", "ASC", "DESC"], {
    error: "Sort direction must be 'asc' or 'desc'",
  })
  .transform((val) => val.toLowerCase())
  .default("desc");

export const sortFieldSchema = z
  .string()
  .min(1, "Sort field cannot be empty")
  .max(50, "Sort field must be less than 50 characters")
  .regex(
    /^[a-zA-Z][a-zA-Z0-9_]*$/,
    "Sort field must start with a letter and contain only letters, numbers, and underscores",
  );

export const sortSchema = z
  .string()
  .regex(
    /^[a-zA-Z][a-zA-Z0-9_]*(:(?:asc|desc|ASC|DESC))?$/,
    "Invalid sort format. Use 'field' or 'field:asc|desc'",
  )
  .transform((val) => {
    const [field, direction = "desc"] = val.split(":");
    return {
      field,
      direction: direction.toLowerCase() as "asc" | "desc",
    };
  });

export const returnedPaginationSchema = z.object({
  page: pageSchema,
  total: z.number().min(0),
  totalPages: z.number().min(0),
});

export const paginationQuerySchema = z.object({
  page: pageSchema,
  limit: limitSchema,
  sort: sortSchema.optional(),
});

export const offsetPaginationQuerySchema = z.object({
  offset: offsetSchema,
  limit: limitSchema,
  sort: sortSchema.optional(),
});

export const optionalOffsetAndPagePaginationQuerySchema = z.object({
  page: pageSchema,
  offset: offsetSchema,
  limit: limitSchema,
  sort: sortSchema.optional(),
});

export const searchQuerySchema = z
  .string()
  .min(1, "Search query cannot be empty")
  .max(200, "Search query must be less than 200 characters")
  .trim();

export const searchQuerySchemaOptional = searchQuerySchema.optional();

export const paginationWithSearchQuerySchema = paginationQuerySchema.extend({
  search: searchQuerySchemaOptional,
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
export type OffsetPaginationQuery = z.infer<typeof offsetPaginationQuerySchema>;
export type OffsetAndPagePaginationQuery = z.infer<typeof optionalOffsetAndPagePaginationQuerySchema>;
export type SortQuery = z.infer<typeof sortSchema>;
export type SearchQuery = z.infer<typeof searchQuerySchema>;
export type PaginationWithSearchQuery = z.infer<typeof paginationWithSearchQuerySchema>;
