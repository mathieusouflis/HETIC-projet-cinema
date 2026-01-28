import type {
  OffsetPaginationQuery,
  PaginationQuery,
} from "../schemas/base/pagination.schema.js";

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

/**
 * Calculate pagination metadata from page-based pagination
 *
 * @param page - Current page number (1-based)
 * @param limit - Number of items per page
 * @param total - Total number of items
 * @returns Pagination metadata
 *
 * @example
 * ```ts
 * const meta = calculatePaginationMeta(2, 10, 45);
 * // {
 * //   page: 2,
 * //   limit: 10,
 * //   total: 45,
 * //   totalPages: 5,
 * //   hasNextPage: true,
 * //   hasPreviousPage: true
 * // }
 * ```
 */
export function calculatePaginationMeta(
  page: number,
  limit: number,
  total: number
): PaginationMeta {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

/**
 * Calculate offset-based pagination metadata
 *
 * @param offset - Starting position
 * @param limit - Number of items to return
 * @param total - Total number of items
 * @returns Offset pagination metadata
 *
 * @example
 * ```ts
 * const meta = calculateOffsetPaginationMeta(20, 10, 45);
 * // {
 * //   offset: 20,
 * //   limit: 10,
 * //   total: 45,
 * //   hasMore: true
 * // }
 * ```
 */
export function calculateOffsetPaginationMeta(
  offset: number,
  limit: number,
  total: number
): OffsetPaginationMeta {
  return {
    offset,
    limit,
    total,
    hasMore: offset + limit < total,
  };
}

/**
 * Calculate skip value from page and limit
 *
 * @param page - Current page number (1-based)
 * @param limit - Number of items per page
 * @returns Number of items to skip
 *
 * @example
 * ```ts
 * const skip = calculateSkip(3, 10); // 20
 * ```
 */
export function calculateSkip(page: number, limit: number): number {
  return (page - 1) * limit;
}

/**
 * Normalize pagination parameters with defaults and bounds
 *
 * @param params - Raw pagination parameters
 * @param defaults - Default values
 * @returns Normalized pagination parameters
 *
 * @example
 * ```ts
 * const normalized = normalizePaginationParams(
 *   { page: -1, limit: 1000 },
 *   { page: 1, limit: 25, maxLimit: 100 }
 * );
 * // { page: 1, limit: 100 }
 * ```
 */
export function normalizePaginationParams(
  params: Partial<PaginationQuery>,
  defaults: {
    page?: number;
    limit?: number;
    maxLimit?: number;
  } = {}
): { page: number; limit: number } {
  const defaultPage = defaults.page ?? 1;
  const defaultLimit = defaults.limit ?? 25;
  const maxLimit = defaults.maxLimit ?? 100;

  const page = Math.max(1, params.page ?? defaultPage);
  const limit = Math.min(maxLimit, Math.max(1, params.limit ?? defaultLimit));

  return { page, limit };
}

/**
 * Normalize offset pagination parameters with defaults and bounds
 *
 * @param params - Raw offset pagination parameters
 * @param defaults - Default values
 * @returns Normalized offset pagination parameters
 *
 * @example
 * ```ts
 * const normalized = normalizeOffsetPaginationParams(
 *   { offset: -5, limit: 1000 },
 *   { offset: 0, limit: 25, maxLimit: 100 }
 * );
 * // { offset: 0, limit: 100 }
 * ```
 */
export function normalizeOffsetPaginationParams(
  params: Partial<OffsetPaginationQuery>,
  defaults: {
    offset?: number;
    limit?: number;
    maxLimit?: number;
  } = {}
): { offset: number; limit: number } {
  const defaultOffset = defaults.offset ?? 0;
  const defaultLimit = defaults.limit ?? 25;
  const maxLimit = defaults.maxLimit ?? 100;

  const offset = Math.max(0, params.offset ?? defaultOffset);
  const limit = Math.min(maxLimit, Math.max(1, params.limit ?? defaultLimit));

  return { offset, limit };
}

/**
 * Create a paginated result object
 *
 * @param items - Array of items
 * @param page - Current page number
 * @param limit - Items per page
 * @param total - Total number of items
 * @returns Paginated result with metadata
 *
 * @example
 * ```ts
 * const result = createPaginatedResult(users, 2, 10, 45);
 * ```
 */
export function createPaginatedResult<T>(
  items: T[],
  page: number,
  limit: number,
  total: number
): PaginatedResult<T> {
  return {
    items,
    pagination: calculatePaginationMeta(page, limit, total),
  };
}

/**
 * Create an offset-paginated result object
 *
 * @param items - Array of items
 * @param offset - Starting position
 * @param limit - Number of items
 * @param total - Total number of items
 * @returns Offset paginated result with metadata
 *
 * @example
 * ```ts
 * const result = createOffsetPaginatedResult(users, 20, 10, 45);
 * ```
 */
export function createOffsetPaginatedResult<T>(
  items: T[],
  offset: number,
  limit: number,
  total: number
): OffsetPaginatedResult<T> {
  return {
    items,
    pagination: calculateOffsetPaginationMeta(offset, limit, total),
  };
}

/**
 * Convert offset to page number
 *
 * @param offset - Starting position
 * @param limit - Items per page
 * @returns Page number (1-based)
 *
 * @example
 * ```ts
 * const page = offsetToPage(20, 10); // 3
 * ```
 */
export function offsetToPage(offset: number, limit: number): number {
  return Math.floor(offset / limit) + 1;
}

/**
 * Convert page number to offset
 *
 * @param page - Page number (1-based)
 * @param limit - Items per page
 * @returns Offset value
 *
 * @example
 * ```ts
 * const offset = pageToOffset(3, 10); // 20
 * ```
 */
export function pageToOffset(page: number, limit: number): number {
  return calculateSkip(page, limit);
}

/**
 * Check if a page is valid for the given total and limit
 *
 * @param page - Page number to check
 * @param limit - Items per page
 * @param total - Total number of items
 * @returns True if the page is valid
 *
 * @example
 * ```ts
 * isValidPage(3, 10, 45); // true
 * isValidPage(10, 10, 45); // false
 * ```
 */
export function isValidPage(
  page: number,
  limit: number,
  total: number
): boolean {
  if (page < 1) return false;
  if (total === 0) return page === 1;

  const totalPages = Math.ceil(total / limit);
  return page <= totalPages;
}

/**
 * Get pagination range for display (e.g., "1-10 of 45")
 *
 * @param page - Current page number
 * @param limit - Items per page
 * @param total - Total number of items
 * @returns Object with start, end, and total
 *
 * @example
 * ```ts
 * const range = getPaginationRange(2, 10, 45);
 * // { start: 11, end: 20, total: 45 }
 * ```
 */
export function getPaginationRange(
  page: number,
  limit: number,
  total: number
): { start: number; end: number; total: number } {
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return { start, end, total };
}

/**
 * Format pagination range as string
 *
 * @param page - Current page number
 * @param limit - Items per page
 * @param total - Total number of items
 * @returns Formatted string (e.g., "11-20 of 45")
 *
 * @example
 * ```ts
 * const rangeStr = formatPaginationRange(2, 10, 45);
 * // "11-20 of 45"
 * ```
 */
export function formatPaginationRange(
  page: number,
  limit: number,
  total: number
): string {
  const { start, end } = getPaginationRange(page, limit, total);

  if (total === 0) {
    return "0 of 0";
  }

  return `${start}-${end} of ${total}`;
}
