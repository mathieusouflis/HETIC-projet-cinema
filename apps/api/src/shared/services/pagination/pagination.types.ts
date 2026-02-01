/**
 * Pagination types for page-based and offset-based pagination
 */

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface OffsetPaginationMeta {
  offset: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: PaginationMeta;
}

export interface OffsetPaginatedResult<T> {
  items: T[];
  pagination: OffsetPaginationMeta;
}

export interface PaginationServiceConfig {
  defaultPage?: number;
  defaultLimit?: number;
  maxLimit?: number;
  defaultOffset?: number;
}
