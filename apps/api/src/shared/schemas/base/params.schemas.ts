import { z } from "zod";
import { uuidSchema } from "../fields/uuid.schema";

/**
 * Shared parameter schemas for common route patterns
 */

/**
 * Standard ID parameter schema for routes like /:id
 * Used by GET, PATCH, DELETE endpoints that accept a single ID parameter
 */
export const idParamsSchema = z.object({
  id: uuidSchema,
});

export type IdParams = z.infer<typeof idParamsSchema>;

/**
 * Content ID parameter schema for routes that reference content
 */
export const contentIdParamsSchema = z.object({
  contentId: uuidSchema,
});

export type ContentIdParams = z.infer<typeof contentIdParamsSchema>;
