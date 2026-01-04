import { z } from "zod";

/**
 * Username field Schema
 *
 * Requirements:
 * - Minimum 3 characters
 * - Maximum 30 characters
 * - Only letters, numbers, underscores, and hyphens
 * - Trimmed whitespace
 */
export const usernameSchema = z
  .string("Username must be a string")
  .nonempty("Username is required")
  .min(3, "Username must be at least 3 characters")
  .max(30, "Username must be less than 30 characters")
  .regex(
    /^[a-zA-Z0-9_-]+$/,
    "Username can only contain letters, numbers, underscores, and hyphens",
  )
  .trim();

export const usernameSchemaOptional = usernameSchema.optional();

export type Username = z.infer<typeof usernameSchema>;
