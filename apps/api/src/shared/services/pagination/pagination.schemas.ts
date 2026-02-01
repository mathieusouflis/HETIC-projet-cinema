import { z } from "zod";

/**
 * Base schemas for pagination values
 */
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
    message: "Sort direction must be 'asc' or 'desc'",
  })
  .transform((val) => val.toLowerCase() as "asc" | "desc")
  .default("desc");

export const sortFieldSchema = z
  .string()
  .min(1, "Sort field cannot be empty")
  .max(50, "Sort field must be less than 50 characters")
  .regex(
    /^[a-zA-Z][a-zA-Z0-9_]*$/,
    "Sort field must start with a letter and contain only letters, numbers, and underscores"
  );

export const sortSchema = z
  .string()
  .regex(
    /^[a-zA-Z][a-zA-Z0-9_]*(:(?:asc|desc|ASC|DESC))?$/,
    "Invalid sort format. Use 'field' or 'field:asc|desc'"
  )
  .transform((val) => {
    const [field, direction = "desc"] = val.split(":");
    return {
      field,
      direction: direction.toLowerCase() as "asc" | "desc",
    };
  });

/**
 * Page-based pagination query schema
 * Use this for traditional page-based pagination (page=1, page=2, etc.)
 */
export const pagePaginationQuerySchema = z.object({
  page: pageSchema,
  limit: limitSchema,
});

/**
 * Offset-based pagination query schema
 * Use this for infinite scroll or cursor-based pagination
 */
export const offsetPaginationQuerySchema = z.object({
  offset: offsetSchema,
  limit: limitSchema,
  sort: sortSchema.optional(),
});

/**
 * Flexible pagination schema that accepts BOTH page and offset
 * but enforces that only ONE can be provided at a time
 *
 * This is useful for endpoints that support both pagination styles.
 * The schema will validate that either page OR offset is provided, but not both.
 *
 * @example
 * ✓ Valid: { page: 1, limit: 20 }
 * ✓ Valid: { offset: 0, limit: 20 }
 * ✗ Invalid: { page: 1, offset: 0, limit: 20 } - both provided
 * ✗ Invalid: { limit: 20 } - neither provided
 */
export const flexiblePaginationQuerySchema = z
  .object({
    page: pageSchema.optional(),
    offset: offsetSchema.optional(),
    limit: limitSchema,
  })
  .refine(
    (data) => {
      // Exactly one of page or offset must be defined
      const hasPage = data.page !== undefined;
      const hasOffset = data.offset !== undefined;
      return hasPage !== hasOffset; // XOR condition
    },
    {
      message: "Provide either 'page' or 'offset', not both",
    }
  );

/**
 * Search query schema
 */
export const searchQuerySchema = z
  .string()
  .min(1, "Search query cannot be empty")
  .max(200, "Search query must be less than 200 characters")
  .trim();

export const searchQuerySchemaOptional = searchQuerySchema.optional();

/**
 * Pagination with search support
 */
export const paginationWithSearchQuerySchema = pagePaginationQuerySchema.extend(
  {
    search: searchQuerySchemaOptional,
  }
);

/**
 * Pagination metadata response schema (for OpenAPI)
 */
export const paginationMetaResponseSchema = z.object({
  page: z.number().int().min(1),
  limit: z.number().int().min(1),
  total: z.number().int().min(0),
  totalPages: z.number().int().min(0),
  hasNextPage: z.boolean(),
  hasPreviousPage: z.boolean(),
});

/**
 * Offset pagination metadata response schema (for OpenAPI)
 */
export const offsetPaginationMetaResponseSchema = z.object({
  offset: z.number().int().min(0),
  limit: z.number().int().min(1),
  total: z.number().int().min(0),
  hasMore: z.boolean(),
});

/**
 * Type exports
 */
export type PagePaginationQuery = z.infer<typeof pagePaginationQuerySchema>;
export type OffsetPaginationQuery = z.infer<typeof offsetPaginationQuerySchema>;
export type FlexiblePaginationQuery = z.infer<
  typeof flexiblePaginationQuerySchema
>;
export type SortQuery = z.infer<typeof sortSchema>;
export type SearchQuery = z.infer<typeof searchQuerySchema>;
export type PaginationWithSearchQuery = z.infer<
  typeof paginationWithSearchQuerySchema
>;

/**
 * Legacy type exports for backward compatibility
 * @deprecated Use PagePaginationQuery instead
 */
export type PaginationQuery = PagePaginationQuery;

/**
 * @deprecated Use FlexiblePaginationQuery with proper validation instead
 */
export type OffsetAndPagePaginationQuery = z.infer<
  typeof flexiblePaginationQuerySchema
>;
