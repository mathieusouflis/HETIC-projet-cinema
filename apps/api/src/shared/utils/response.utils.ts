import type {
  ErrorResponse,
  PaginatedResponse,
  SuccessResponse,
  SuccessWithMessage,
} from "../schemas/base/response.schemas.js";
import type {
  OffsetPaginatedResult,
  OffsetPaginationMeta,
  PaginatedResult,
  PaginationMeta,
} from "./pagination.utils.js";

export type ApiResponse<T = unknown> =
  | SuccessResponse<T>
  | SuccessWithMessage<T>
  | PaginatedResponse<T>
  | ErrorResponse;

/**
 * Build a success response with data
 *
 * @param data - The data to include in the response
 * @returns Success response object
 *
 * @example
 * ```ts
 * const response = buildSuccessResponse({ id: "123", name: "John" });
 * // { success: true, data: { id: "123", name: "John" } }
 * ```
 */
export function buildSuccessResponse<T>(data: T): SuccessResponse<T> {
  return {
    success: true,
    data,
  };
}

/**
 * Build a success response with data and message
 *
 * @param data - The data to include in the response
 * @param message - Success message
 * @returns Success response object with message
 *
 * @example
 * ```ts
 * const response = buildSuccessWithMessage(
 *   { id: "123" },
 *   "User created successfully"
 * );
 * // {
 * //   success: true,
 * //   message: "User created successfully",
 * //   data: { id: "123" }
 * // }
 * ```
 */
export function buildSuccessWithMessage<T>(
  data: T,
  message: string
): SuccessWithMessage<T> {
  return {
    success: true,
    message,
    data,
  };
}

/**
 * Build a paginated response from items and pagination metadata
 *
 * @param items - Array of items to include
 * @param pagination - Pagination metadata
 * @returns Paginated response object
 *
 * @example
 * ```ts
 * const response = buildPaginatedResponse(users, {
 *   page: 1,
 *   limit: 10,
 *   total: 45,
 *   totalPages: 5,
 *   hasNextPage: true,
 *   hasPreviousPage: false,
 * });
 * ```
 */
export function buildPaginatedResponse<T>(
  items: T[],
  pagination: PaginationMeta
): PaginatedResponse<T> {
  return {
    success: true,
    data: {
      items,
      pagination: {
        page: pagination.page,
        total: pagination.total,
        totalPages: pagination.totalPages,
      },
    },
  };
}

/**
 * Build a paginated response from a PaginatedResult
 *
 * @param result - Paginated result with items and metadata
 * @returns Paginated response object
 *
 * @example
 * ```ts
 * const result = createPaginatedResult(users, 1, 10, 45);
 * const response = buildPaginatedResponseFromResult(result);
 * ```
 */
export function buildPaginatedResponseFromResult<T>(
  result: PaginatedResult<T>
): PaginatedResponse<T> {
  return buildPaginatedResponse(result.items, result.pagination);
}

/**
 * Build an error response
 *
 * @param error - Error message
 * @param details - Optional error details
 * @returns Error response object
 *
 * @example
 * ```ts
 * const response = buildErrorResponse("User not found", { userId: "123" });
 * // {
 * //   success: false,
 * //   error: "User not found",
 * //   details: { userId: "123" }
 * // }
 * ```
 */
export function buildErrorResponse(
  error: string,
  details?: unknown
): ErrorResponse {
  return {
    success: false,
    error,
    ...(details !== undefined && { details }),
  };
}

/**
 * Build a list response (non-paginated array)
 *
 * @param items - Array of items
 * @returns Success response with array data
 *
 * @example
 * ```ts
 * const response = buildListResponse(tags);
 * // { success: true, data: [...tags] }
 * ```
 */
export function buildListResponse<T>(items: T[]): SuccessResponse<T[]> {
  return buildSuccessResponse(items);
}

/**
 * Build an empty success response
 *
 * @param message - Optional success message
 * @returns Success response with no data
 *
 * @example
 * ```ts
 * const response = buildEmptyResponse("Operation completed");
 * // { success: true, message: "Operation completed" }
 * ```
 */
export function buildEmptyResponse(message?: string): {
  success: true;
  message?: string;
} {
  return {
    success: true,
    ...(message && { message }),
  };
}

/**
 * Extended pagination metadata with additional offset information
 */
export interface ExtendedPaginationMeta extends PaginationMeta {
  offset: number;
}

/**
 * Extended paginated response with offset metadata
 */
export interface ExtendedPaginatedResponse<T> {
  success: true;
  data: {
    items: T[];
    pagination: {
      page: number;
      total: number;
      totalPages: number;
      offset: number;
      limit: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  };
}

/**
 * Build an extended paginated response with full metadata
 *
 * @param items - Array of items
 * @param pagination - Extended pagination metadata
 * @returns Extended paginated response
 *
 * @example
 * ```ts
 * const response = buildExtendedPaginatedResponse(users, {
 *   page: 2,
 *   limit: 10,
 *   total: 45,
 *   totalPages: 5,
 *   offset: 10,
 *   hasNextPage: true,
 *   hasPreviousPage: true,
 * });
 * ```
 */
export function buildExtendedPaginatedResponse<T>(
  items: T[],
  pagination: ExtendedPaginationMeta
): ExtendedPaginatedResponse<T> {
  return {
    success: true,
    data: {
      items,
      pagination: {
        page: pagination.page,
        total: pagination.total,
        totalPages: pagination.totalPages,
        offset: pagination.offset,
        limit: pagination.limit,
        hasNextPage: pagination.hasNextPage,
        hasPreviousPage: pagination.hasPreviousPage,
      },
    },
  };
}

/**
 * Offset-based paginated response
 */
export interface OffsetPaginatedResponse<T> {
  success: true;
  data: {
    items: T[];
    pagination: {
      offset: number;
      limit: number;
      total: number;
      hasMore: boolean;
    };
  };
}

/**
 * Build an offset-based paginated response
 *
 * @param items - Array of items
 * @param pagination - Offset pagination metadata
 * @returns Offset paginated response
 *
 * @example
 * ```ts
 * const response = buildOffsetPaginatedResponse(users, {
 *   offset: 20,
 *   limit: 10,
 *   total: 45,
 *   hasMore: true,
 * });
 * ```
 */
export function buildOffsetPaginatedResponse<T>(
  items: T[],
  pagination: OffsetPaginationMeta
): OffsetPaginatedResponse<T> {
  return {
    success: true,
    data: {
      items,
      pagination: {
        offset: pagination.offset,
        limit: pagination.limit,
        total: pagination.total,
        hasMore: pagination.hasMore,
      },
    },
  };
}

/**
 * Build an offset paginated response from a result object
 *
 * @param result - Offset paginated result
 * @returns Offset paginated response
 *
 * @example
 * ```ts
 * const result = createOffsetPaginatedResult(users, 20, 10, 45);
 * const response = buildOffsetPaginatedResponseFromResult(result);
 * ```
 */
export function buildOffsetPaginatedResponseFromResult<T>(
  result: OffsetPaginatedResult<T>
): OffsetPaginatedResponse<T> {
  return buildOffsetPaginatedResponse(result.items, result.pagination);
}

/**
 * Transform data with a mapping function and wrap in success response
 *
 * @param data - Raw data to transform
 * @param mapper - Transformation function
 * @returns Success response with transformed data
 *
 * @example
 * ```ts
 * const response = transformAndWrap(userEntity, (user) => user.toDTO());
 * ```
 */
export function transformAndWrap<T, R>(
  data: T,
  mapper: (data: T) => R
): SuccessResponse<R> {
  return buildSuccessResponse(mapper(data));
}

/**
 * Transform array data with a mapping function and wrap in success response
 *
 * @param items - Array of items to transform
 * @param mapper - Transformation function
 * @returns Success response with transformed array
 *
 * @example
 * ```ts
 * const response = transformArrayAndWrap(userEntities, (user) => user.toDTO());
 * ```
 */
export function transformArrayAndWrap<T, R>(
  items: T[],
  mapper: (item: T) => R
): SuccessResponse<R[]> {
  return buildSuccessResponse(items.map(mapper));
}

/**
 * Transform paginated data with a mapping function
 *
 * @param result - Paginated result
 * @param mapper - Transformation function
 * @returns Paginated response with transformed items
 *
 * @example
 * ```ts
 * const response = transformPaginatedData(
 *   paginatedUsers,
 *   (user) => user.toDTO()
 * );
 * ```
 */
export function transformPaginatedData<T, R>(
  result: PaginatedResult<T>,
  mapper: (item: T) => R
): PaginatedResponse<R> {
  return buildPaginatedResponse(result.items.map(mapper), result.pagination);
}

/**
 * Transform offset paginated data with a mapping function
 *
 * @param result - Offset paginated result
 * @param mapper - Transformation function
 * @returns Offset paginated response with transformed items
 *
 * @example
 * ```ts
 * const response = transformOffsetPaginatedData(
 *   offsetPaginatedUsers,
 *   (user) => user.toDTO()
 * );
 * ```
 */
export function transformOffsetPaginatedData<T, R>(
  result: OffsetPaginatedResult<T>,
  mapper: (item: T) => R
): OffsetPaginatedResponse<R> {
  return buildOffsetPaginatedResponse(
    result.items.map(mapper),
    result.pagination
  );
}
