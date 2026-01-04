import { z } from "zod";

export const baseErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string(),
});

export const detailedErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  details: z.unknown(),
});

export const validationErrorFieldSchema = z.object({
  field: z.string(),
  message: z.string(),
  code: z.string().optional(),
});

export const validationErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  details: z.array(validationErrorFieldSchema),
});

export const unauthorizedErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string().default("Not authenticated"),
});

export const forbiddenErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string().default("Forbidden - insufficient permissions"),
});

export const notFoundErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string(),
});

export const conflictErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  details: z
    .object({
      field: z.string().optional(),
      conflictingValue: z.unknown().optional(),
    })
    .optional(),
});

export const internalServerErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string().default("Internal server error"),
  details: z.string().optional(),
});

/**
 * Helper to create custom error response
 *
 * @example
 * ```ts
 * const customError = createErrorResponse('Custom error message');
 * ```
 */
export function createErrorResponse(message: string) {
  return z.object({
    success: z.literal(false),
    error: z.literal(message),
  });
}

/**
 * Helper to create error with details
 *
 * @example
 * ```ts
 * const errorWithDetails = createDetailedError('Error occurred', detailsSchema);
 * ```
 */
export function createDetailedError<T extends z.ZodTypeAny>(
  message: string,
  detailsSchema: T,
) {
  return z.object({
    success: z.literal(false),
    error: z.literal(message),
    details: detailsSchema,
  });
}

export const commonErrorResponses = {
  400: validationErrorResponseSchema,
  401: unauthorizedErrorResponseSchema,
  403: forbiddenErrorResponseSchema,
  404: notFoundErrorResponseSchema,
  409: conflictErrorResponseSchema,
  500: internalServerErrorResponseSchema,
} as const;

export type ValidationError = z.infer<typeof validationErrorResponseSchema>;
export type UnauthorizedError = z.infer<typeof unauthorizedErrorResponseSchema>;
export type ForbiddenError = z.infer<typeof forbiddenErrorResponseSchema>;
export type NotFoundError = z.infer<typeof notFoundErrorResponseSchema>;
export type ConflictError = z.infer<typeof conflictErrorResponseSchema>;
export type InternalServerError = z.infer<
  typeof internalServerErrorResponseSchema
>;
