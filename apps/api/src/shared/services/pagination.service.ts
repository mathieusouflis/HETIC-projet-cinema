import type {
  OffsetPaginationQuery,
  PaginationQuery,
} from "../schemas/base/pagination.schema.js";
import {
  calculatePaginationMeta,
  calculateSkip,
  createOffsetPaginatedResult,
  createPaginatedResult,
  normalizeOffsetPaginationParams,
  normalizePaginationParams,
  type OffsetPaginatedResult,
  type PaginatedResult,
  type PaginationMeta,
} from "../utils/pagination.utils.js";

export interface PaginationServiceConfig {
  defaultPage?: number;
  defaultLimit?: number;
  maxLimit?: number;
  defaultOffset?: number;
}

/**
 * PaginationService
 *
 * Provides consistent pagination handling across the application.
 * Supports both page-based and offset-based pagination strategies.
 *
 * @example
 * ```ts
 * const paginationService = new PaginationService({
 *   defaultLimit: 20,
 *   maxLimit: 50,
 * });
 *
 * // In a use case
 * const { page, limit, skip } = paginationService.parsePageParams(query);
 * const users = await repository.find({ skip, limit });
 * const total = await repository.count();
 * const result = paginationService.createPageResult(users, page, limit, total);
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

  /**
   * Parse and normalize page-based pagination parameters
   *
   * @param params - Raw pagination parameters from request
   * @returns Normalized pagination parameters with skip value
   *
   * @example
   * ```ts
   * const { page, limit, skip } = paginationService.parsePageParams(req.query);
   * ```
   */
  parsePageParams(params: Partial<PaginationQuery>): {
    page: number;
    limit: number;
    skip: number;
  } {
    const { page, limit } = normalizePaginationParams(params, {
      page: this.config.defaultPage,
      limit: this.config.defaultLimit,
      maxLimit: this.config.maxLimit,
    });

    const skip = calculateSkip(page, limit);

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
   * ```
   */
  parseOffsetParams(params: Partial<OffsetPaginationQuery>): {
    offset: number;
    limit: number;
  } {
    return normalizeOffsetPaginationParams(params, {
      offset: this.config.defaultOffset,
      limit: this.config.defaultLimit,
      maxLimit: this.config.maxLimit,
    });
  }

  /**
   * Create a page-based paginated result
   *
   * @param items - Array of items for the current page
   * @param page - Current page number
   * @param limit - Items per page
   * @param total - Total number of items
   * @returns Paginated result with metadata
   *
   * @example
   * ```ts
   * const result = paginationService.createPageResult(users, 1, 10, 45);
   * ```
   */
  createPageResult<T>(
    items: T[],
    page: number,
    limit: number,
    total: number
  ): PaginatedResult<T> {
    return createPaginatedResult(items, page, limit, total);
  }

  /**
   * Create an offset-based paginated result
   *
   * @param items - Array of items
   * @param offset - Starting position
   * @param limit - Number of items
   * @param total - Total number of items
   * @returns Offset paginated result with metadata
   *
   * @example
   * ```ts
   * const result = paginationService.createOffsetResult(users, 20, 10, 45);
   * ```
   */
  createOffsetResult<T>(
    items: T[],
    offset: number,
    limit: number,
    total: number
  ): OffsetPaginatedResult<T> {
    return createOffsetPaginatedResult(items, offset, limit, total);
  }

  /**
   * Calculate pagination metadata only
   *
   * @param page - Current page number
   * @param limit - Items per page
   * @param total - Total number of items
   * @returns Pagination metadata
   *
   * @example
   * ```ts
   * const meta = paginationService.calculateMeta(2, 10, 45);
   * ```
   */
  calculateMeta(page: number, limit: number, total: number): PaginationMeta {
    return calculatePaginationMeta(page, limit, total);
  }

  /**
   * Get default configuration
   *
   * @returns Current pagination configuration
   */
  getConfig(): Readonly<Required<PaginationServiceConfig>> {
    return { ...this.config };
  }

  /**
   * Calculate skip value for database queries
   *
   * @param page - Page number
   * @param limit - Items per page
   * @returns Number of items to skip
   *
   * @example
   * ```ts
   * const skip = paginationService.calculateSkip(3, 10); // 20
   * ```
   */
  calculateSkip(page: number, limit: number): number {
    return calculateSkip(page, limit);
  }

  /**
   * Validate and get safe page number
   *
   * @param page - Raw page number
   * @returns Valid page number (minimum 1)
   *
   * @example
   * ```ts
   * const safePage = paginationService.getSafePage(-1); // 1
   * ```
   */
  getSafePage(page: number | undefined | null): number {
    return Math.max(1, page ?? this.config.defaultPage);
  }

  /**
   * Validate and get safe limit
   *
   * @param limit - Raw limit value
   * @returns Valid limit within bounds
   *
   * @example
   * ```ts
   * const safeLimit = paginationService.getSafeLimit(1000); // 100 (maxLimit)
   * ```
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
   *
   * @example
   * ```ts
   * const safeOffset = paginationService.getSafeOffset(-5); // 0
   * ```
   */
  getSafeOffset(offset: number | undefined | null): number {
    return Math.max(0, offset ?? this.config.defaultOffset);
  }

  /**
   * Create paginated result with transformation
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
   *   (user) => user.toDTO(),
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
   *
   * @example
   * ```ts
   * const result = paginationService.createOffsetResultWithMapper(
   *   userEntities,
   *   (user) => user.toDTO(),
   *   20,
   *   10,
   *   45
   * );
   * ```
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
}

/**
 * Default pagination service instance
 */
export const paginationService = new PaginationService();
