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
 * Create a success response with data
 *
 * @param data - The data to include in the response
 * @returns Success response object
 *
 * @example
 * ```ts
 * const response = createSuccessResponse({ id: "123", name: "John" });
 * // { success: true, data: { id: "123", name: "John" } }
 * ```
 */
export function createSuccessResponse<T>(data: T): SuccessResponse<T> {
  return {
    success: true,
    data,
  };
}

/**
 * Create a success response with data and message
 *
 * @param data - The data to include in the response
 * @param message - Success message
 * @returns Success response object with message
 *
 * @example
 * ```ts
 * const response = createSuccessWithMessage(
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
export function createSuccessWithMessage<T>(
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
 * Create a paginated response from items and pagination metadata
 *
 * @param items - Array of items to include
 * @param pagination - Pagination metadata
 * @returns Paginated response object
 *
 * @example
 * ```ts
 * const response = createPaginatedResponse(users, {
 *   page: 1,
 *   limit: 10,
 *   total: 45,
 *   totalPages: 5,
 *   hasNextPage: true,
 *   hasPreviousPage: false,
 * });
 * ```
 */
export function createPaginatedResponse<T>(
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
 * Create a paginated response from a PaginatedResult
 *
 * @param result - Paginated result with items and metadata
 * @returns Paginated response object
 *
 * @example
 * ```ts
 * const result = createPaginatedResult(users, 1, 10, 45);
 * const response = createPaginatedResponseFromResult(result);
 * ```
 */
export function createPaginatedResponseFromResult<T>(
  result: PaginatedResult<T>
): PaginatedResponse<T> {
  return createPaginatedResponse(result.items, result.pagination);
}

/**
 * Create an error response
 *
 * @param error - Error message
 * @param details - Optional error details
 * @returns Error response object
 *
 * @example
 * ```ts
 * const response = createErrorResponse("User not found", { userId: "123" });
 * // {
 * //   success: false,
 * //   error: "User not found",
 * //   details: { userId: "123" }
 * // }
 * ```
 */
export function createErrorResponse(
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
 * Create a list response (non-paginated array)
 *
 * @param items - Array of items
 * @returns Success response with array data
 *
 * @example
 * ```ts
 * const response = createListResponse(tags);
 * // { success: true, data: [...tags] }
 * ```
 */
export function createListResponse<T>(items: T[]): SuccessResponse<T[]> {
  return createSuccessResponse(items);
}

/**
 * Create an empty success response
 *
 * @param message - Optional success message
 * @returns Success response with no data
 *
 * @example
 * ```ts
 * const response = createEmptyResponse("Operation completed");
 * // { success: true, message: "Operation completed" }
 * ```
 */
export function createEmptyResponse(message?: string): {
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
 * Create an extended paginated response with full metadata
 *
 * @param items - Array of items
 * @param pagination - Extended pagination metadata
 * @returns Extended paginated response
 *
 * @example
 * ```ts
 * const response = createExtendedPaginatedResponse(users, {
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
export function createExtendedPaginatedResponse<T>(
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
 * Create an offset-based paginated response
 *
 * @param items - Array of items
 * @param pagination - Offset pagination metadata
 * @returns Offset paginated response
 *
 * @example
 * ```ts
 * const response = createOffsetPaginatedResponse(users, {
 *   offset: 20,
 *   limit: 10,
 *   total: 45,
 *   hasMore: true,
 * });
 * ```
 */
export function createOffsetPaginatedResponse<T>(
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
 * Create an offset paginated response from a result object
 *
 * @param result - Offset paginated result
 * @returns Offset paginated response
 *
 * @example
 * ```ts
 * const result = createOffsetPaginatedResult(users, 20, 10, 45);
 * const response = createOffsetPaginatedResponseFromResult(result);
 * ```
 */
export function createOffsetPaginatedResponseFromResult<T>(
  result: OffsetPaginatedResult<T>
): OffsetPaginatedResponse<T> {
  return createOffsetPaginatedResponse(result.items, result.pagination);
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
  return createSuccessResponse(mapper(data));
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
  return createSuccessResponse(items.map(mapper));
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
  return createPaginatedResponse(result.items.map(mapper), result.pagination);
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
  return createOffsetPaginatedResponse(
    result.items.map(mapper),
    result.pagination
  );
}
