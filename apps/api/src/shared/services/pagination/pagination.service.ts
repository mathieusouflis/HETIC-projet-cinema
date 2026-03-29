import type {
  FlexiblePaginationQuery,
  OffsetPaginationQuery,
  PagePaginationQuery,
} from "./pagination.schemas";
import type {
  OffsetPaginatedResult,
  OffsetPaginationMeta,
  PaginatedResult,
  PaginationMeta,
  PaginationServiceConfig,
} from "./pagination.types";

/**
 * PaginationService
 *
 * Provides consistent pagination handling across the application.
 * Supports both page-based and offset-based pagination strategies.
 *
 * **Page-based pagination**: Traditional pagination with page numbers (page=1, page=2, etc.)
 * **Offset-based pagination**: Cursor-style pagination with offset values (offset=0, offset=20, etc.)
 *
 * @example
 * ```ts
 * // Page-based pagination
 * const { page, limit, skip } = paginationService.parsePageParams(query);
 * const users = await repository.find({ skip, limit });
 * const total = await repository.count();
 * const result = paginationService.createPageResult(users, page, limit, total);
 * ```
 *
 * @example
 * ```ts
 * // Offset-based pagination
 * const { offset, limit } = paginationService.parseOffsetParams(query);
 * const users = await repository.find({ offset, limit });
 * const total = await repository.count();
 * const result = paginationService.createOffsetResult(users, offset, limit, total);
 * ```
 */
export class PaginationService {
  private readonly config: Required<PaginationServiceConfig>;

  constructor(config: PaginationServiceConfig = {}) {
    this.config = {
      defaultPage: config.defaultPage ?? 1,
      defaultLimit: config.defaultLimit ?? 25,
      maxLimit: config.maxLimit ?? 100,
      defaultOffset: config.defaultOffset ?? 0,
    };
  }

  // ========================================
  // Parameter Parsing
  // ========================================

  /**
   * Parse and normalize page-based pagination parameters
   *
   * @param params - Raw pagination parameters from request
   * @returns Normalized pagination parameters with skip value for database queries
   *
   * @example
   * ```ts
   * const { page, limit, skip } = paginationService.parsePageParams(req.query);
   * const items = await db.query.items.findMany({ limit, offset: skip });
   * ```
   */
  parsePageParams(params: Partial<PagePaginationQuery>): {
    page: number;
    limit: number;
    skip: number;
  } {
    const page = this.getSafePage(params.page);
    const limit = this.getSafeLimit(params.limit);
    const skip = this.calculateSkip(page, limit);

    return { page, limit, skip };
  }

  /**
   * Parse and normalize offset-based pagination parameters
   *
   * @param params - Raw offset pagination parameters from request
   * @returns Normalized offset pagination parameters
   *
   * @example
   * ```ts
   * const { offset, limit } = paginationService.parseOffsetParams(req.query);
   * const items = await db.query.items.findMany({ limit, offset });
   * ```
   */
  parseOffsetParams(params: Partial<OffsetPaginationQuery>): {
    offset: number;
    limit: number;
  } {
    const offset = this.getSafeOffset(params.offset);
    const limit = this.getSafeLimit(params.limit);

    return { offset, limit };
  }

  /**
   * Parse flexible pagination parameters (supports both page and offset)
   * Automatically detects which pagination style is being used
   *
   * @param params - Pagination parameters (either page or offset based)
   * @returns Normalized parameters for both styles
   *
   * @example
   * ```ts
   * const params = paginationService.parseFlexibleParams(req.query);
   * // Returns: { page, limit, skip, offset, usesPageBased: true|false }
   * ```
   */
  parseFlexibleParams(params: Partial<FlexiblePaginationQuery>): {
    page: number;
    limit: number;
    skip: number;
    offset: number;
    usesPageBased: boolean;
  } {
    const limit = this.getSafeLimit(params.limit);

    // Determine which pagination style is being used
    const usesPageBased = params.page !== undefined;

    if (usesPageBased) {
      const page = this.getSafePage(params.page);
      const skip = this.calculateSkip(page, limit);
      return {
        page,
        limit,
        skip,
        offset: skip, // Offset is same as skip
        usesPageBased: true,
      };
    }

    // Offset-based
    const offset = this.getSafeOffset(params.offset);
    const page = this.offsetToPage(offset, limit);
    return {
      page,
      limit,
      skip: offset,
      offset,
      usesPageBased: false,
    };
  }

  // ========================================
  // Result Creation
  // ========================================

  /**
   * Create a page-based paginated result
   *
   * @param items - Array of items for the current page
   * @param page - Current page number (1-based)
   * @param limit - Items per page
   * @param total - Total number of items across all pages
   * @returns Paginated result with metadata
   *
   * @example
   * ```ts
   * const result = paginationService.createPageResult(users, 1, 10, 45);
   * // {
   * //   items: [...],
   * //   pagination: {
   * //     page: 1,
   * //     limit: 10,
   * //     total: 45,
   * //     totalPages: 5,
   * //     hasNextPage: true,
   * //     hasPreviousPage: false
   * //   }
   * // }
   * ```
   */
  createPageResult<T>(
    items: T[],
    page: number,
    limit: number,
    total: number
  ): PaginatedResult<T> {
    return {
      items,
      pagination: this.calculatePageMeta(page, limit, total),
    };
  }

  /**
   * Create an offset-based paginated result
   *
   * @param items - Array of items
   * @param offset - Starting position (0-based)
   * @param limit - Number of items
   * @param total - Total number of items
   * @returns Offset paginated result with metadata
   *
   * @example
   * ```ts
   * const result = paginationService.createOffsetResult(users, 20, 10, 45);
   * // {
   * //   items: [...],
   * //   pagination: {
   * //     offset: 20,
   * //     limit: 10,
   * //     total: 45,
   * //     hasMore: true
   * //   }
   * // }
   * ```
   */
  createOffsetResult<T>(
    items: T[],
    offset: number,
    limit: number,
    total: number
  ): OffsetPaginatedResult<T> {
    return {
      items,
      pagination: this.calculateOffsetMeta(offset, limit, total),
    };
  }

  /**
   * Create paginated result with item transformation
   *
   * Useful when you need to transform entities to DTOs
   *
   * @param items - Array of items to transform
   * @param mapper - Transformation function
   * @param page - Current page number
   * @param limit - Items per page
   * @param total - Total number of items
   * @returns Paginated result with transformed items
   *
   * @example
   * ```ts
   * const result = paginationService.createPageResultWithMapper(
   *   userEntities,
   *   (user) => user.toJSON(),
   *   1,
   *   10,
   *   45
   * );
   * ```
   */
  createPageResultWithMapper<T, R>(
    items: T[],
    mapper: (item: T) => R,
    page: number,
    limit: number,
    total: number
  ): PaginatedResult<R> {
    const transformedItems = items.map(mapper);
    return this.createPageResult(transformedItems, page, limit, total);
  }

  /**
   * Create offset paginated result with transformation
   *
   * @param items - Array of items to transform
   * @param mapper - Transformation function
   * @param offset - Starting position
   * @param limit - Number of items
   * @param total - Total number of items
   * @returns Offset paginated result with transformed items
   */
  createOffsetResultWithMapper<T, R>(
    items: T[],
    mapper: (item: T) => R,
    offset: number,
    limit: number,
    total: number
  ): OffsetPaginatedResult<R> {
    const transformedItems = items.map(mapper);
    return this.createOffsetResult(transformedItems, offset, limit, total);
  }

  // ========================================
  // Metadata Calculation
  // ========================================

  /**
   * Calculate page-based pagination metadata
   *
   * @param page - Current page number
   * @param limit - Items per page
   * @param total - Total number of items
   * @returns Pagination metadata
   */
  calculatePageMeta(
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
   * @param limit - Number of items
   * @param total - Total number of items
   * @returns Offset pagination metadata
   */
  calculateOffsetMeta(
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

  // ========================================
  // Utility Methods
  // ========================================

  /**
   * Calculate skip value for database queries
   *
   * @param page - Page number (1-based)
   * @param limit - Items per page
   * @returns Number of items to skip
   *
   * @example
   * ```ts
   * const skip = paginationService.calculateSkip(3, 10); // 20
   * ```
   */
  calculateSkip(page: number, limit: number): number {
    return (page - 1) * limit;
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
   * const page = paginationService.offsetToPage(20, 10); // 3
   * ```
   */
  offsetToPage(offset: number, limit: number): number {
    return Math.floor(offset / limit) + 1;
  }

  /**
   * Convert page number to offset
   *
   * @param page - Page number (1-based)
   * @param limit - Items per page
   * @returns Offset value (0-based)
   *
   * @example
   * ```ts
   * const offset = paginationService.pageToOffset(3, 10); // 20
   * ```
   */
  pageToOffset(page: number, limit: number): number {
    return this.calculateSkip(page, limit);
  }

  /**
   * Check if a page is valid for the given total and limit
   *
   * @param page - Page number to check
   * @param limit - Items per page
   * @param total - Total number of items
   * @returns True if the page is valid
   */
  isValidPage(page: number, limit: number, total: number): boolean {
    if (page < 1) {
      return false;
    }
    if (total === 0) {
      return page === 1;
    }

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
   */
  getPaginationRange(
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
   */
  formatPaginationRange(page: number, limit: number, total: number): string {
    const { start, end } = this.getPaginationRange(page, limit, total);

    if (total === 0) {
      return "0 of 0";
    }

    return `${start}-${end} of ${total}`;
  }

  // ========================================
  // Validation & Safety
  // ========================================

  /**
   * Validate and get safe page number
   *
   * @param page - Raw page number
   * @returns Valid page number (minimum 1)
   */
  getSafePage(page: number | undefined | null): number {
    return Math.max(1, page ?? this.config.defaultPage);
  }

  /**
   * Validate and get safe limit
   *
   * @param limit - Raw limit value
   * @returns Valid limit within bounds
   */
  getSafeLimit(limit: number | undefined | null): number {
    return Math.min(
      this.config.maxLimit,
      Math.max(1, limit ?? this.config.defaultLimit)
    );
  }

  /**
   * Validate and get safe offset
   *
   * @param offset - Raw offset value
   * @returns Valid offset (minimum 0)
   */
  getSafeOffset(offset: number | undefined | null): number {
    return Math.max(0, offset ?? this.config.defaultOffset);
  }

  /**
   * Get current configuration
   *
   * @returns Current pagination configuration
   */
  getConfig(): Readonly<Required<PaginationServiceConfig>> {
    return { ...this.config };
  }
}

/**
 * Default pagination service instance
 * Use this throughout the application for consistency
 */
export const paginationService = new PaginationService();
