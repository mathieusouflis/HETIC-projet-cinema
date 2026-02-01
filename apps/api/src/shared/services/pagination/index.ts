/**
 * Pagination Module
 *
 * Provides consistent pagination handling for both page-based and offset-based pagination.
 */

export * from "./pagination.schemas";
export {
  flexiblePaginationQuerySchema,
  offsetPaginationQuerySchema,
  pagePaginationQuerySchema,
  paginationWithSearchQuerySchema,
} from "./pagination.schemas";
export * from "./pagination.service";
// Re-export commonly used items
export { PaginationService, paginationService } from "./pagination.service";
export type {
  OffsetPaginatedResult,
  OffsetPaginationMeta,
  PaginatedResult,
  PaginationMeta,
} from "./pagination.types";
export * from "./pagination.types";
