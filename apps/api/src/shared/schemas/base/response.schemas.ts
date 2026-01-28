import { z } from "zod";

export const successResponseSchema = z.object({
  success: z.literal(true),
  message: z.string().optional(),
});

export const errorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  details: z.unknown().optional(),
});

/**
 * Base data response wrapper
 *
 * Generic success response with data payload
 */
export const baseDataResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    data: dataSchema,
  });

/**
 * Base data response with message
 *
 * Success response with both data and message
 */
export const baseDataWithMessageResponseSchema = <T extends z.ZodTypeAny>(
  dataSchema: T
) =>
  z.object({
    success: z.literal(true),
    message: z.string(),
    data: dataSchema,
  });

/**
 * Base paginated response wrapper
 *
 * Standard structure for paginated list responses
 */
export const basePaginatedResponseSchema = <T extends z.ZodTypeAny>(
  itemSchema: T
) =>
  z.object({
    success: z.literal(true),
    data: z.object({
      items: z.array(itemSchema),
      pagination: z.object({
        page: z.number().int().positive(),
        total: z.number().int().nonnegative(),
        totalPages: z.number().int().nonnegative(),
      }),
    }),
  });

export const baseListResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    success: z.literal(true),
    data: z.array(itemSchema),
  });

export const emptySuccessResponseSchema = z.object({
  success: z.literal(true),
  message: z.string().optional(),
});

/**
 * Helper function to create a success response with data
 *
 * @example
 * ```ts
 * const userResponseSchema = createSuccessResponse(userSchema);
 * ```
 */
export function createSuccessResponse<T extends z.ZodTypeAny>(dataSchema: T) {
  return baseDataResponseSchema(dataSchema);
}

/**
 * Helper function to create a success response with data and message
 *
 * @example
 * ```ts
 * const createdUserResponse = createSuccessWithMessage(userSchema);
 * ```
 */
export function createSuccessWithMessage<T extends z.ZodTypeAny>(
  dataSchema: T
) {
  return baseDataWithMessageResponseSchema(dataSchema);
}

/**
 * Helper function to create a paginated response
 *
 * @example
 * ```ts
 * const usersListResponse = createPaginatedResponse(userSchema);
 * ```
 */
export function createPaginatedResponse<T extends z.ZodTypeAny>(itemSchema: T) {
  return basePaginatedResponseSchema(itemSchema);
}

/**
 * Helper function to create a list response
 *
 * @example
 * ```ts
 * const tagsListResponse = createListResponse(tagSchema);
 * ```
 */
export function createListResponse<T extends z.ZodTypeAny>(itemSchema: T) {
  return baseListResponseSchema(itemSchema);
}

export type SuccessResponse<T> = {
  success: true;
  data: T;
};

export type SuccessWithMessage<T> = {
  success: true;
  message: string;
  data: T;
};

export type ErrorResponse = {
  success: false;
  error: string;
  details?: unknown;
};

export type PaginatedResponse<T> = {
  success: true;
  data: {
    items: T[];
    pagination: {
      page: number;
      total: number;
      totalPages: number;
    };
  };
};

export type ListResponse<T> = {
  success: true;
  data: T[];
};

export type ExtendedPaginatedResponse<T> = {
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
};

export type OffsetPaginatedResponse<T> = {
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
};

/**
 * Extended paginated response schema
 *
 * Includes additional pagination metadata like offset, hasNextPage, hasPreviousPage
 */
export const extendedPaginatedResponseSchema = <T extends z.ZodTypeAny>(
  itemSchema: T
) =>
  z.object({
    success: z.literal(true),
    data: z.object({
      items: z.array(itemSchema),
      pagination: z.object({
        page: z.number().int().positive(),
        total: z.number().int().nonnegative(),
        totalPages: z.number().int().nonnegative(),
        offset: z.number().int().nonnegative(),
        limit: z.number().int().positive(),
        hasNextPage: z.boolean(),
        hasPreviousPage: z.boolean(),
      }),
    }),
  });

/**
 * Offset-based paginated response schema
 *
 * For cursor/offset-based pagination instead of page-based
 */
export const offsetPaginatedResponseSchema = <T extends z.ZodTypeAny>(
  itemSchema: T
) =>
  z.object({
    success: z.literal(true),
    data: z.object({
      items: z.array(itemSchema),
      pagination: z.object({
        offset: z.number().int().nonnegative(),
        limit: z.number().int().positive(),
        total: z.number().int().nonnegative(),
        hasMore: z.boolean(),
      }),
    }),
  });

/**
 * Helper function to create an extended paginated response
 *
 * @example
 * ```ts
 * const usersResponse = createExtendedPaginatedResponse(userSchema);
 * ```
 */
export function createExtendedPaginatedResponse<T extends z.ZodTypeAny>(
  itemSchema: T
) {
  return extendedPaginatedResponseSchema(itemSchema);
}

/**
 * Helper function to create an offset paginated response
 *
 * @example
 * ```ts
 * const usersResponse = createOffsetPaginatedResponse(userSchema);
 * ```
 */
export function createOffsetPaginatedResponse<T extends z.ZodTypeAny>(
  itemSchema: T
) {
  return offsetPaginatedResponseSchema(itemSchema);
}
