import { z } from "zod";

/**
 * Password field Schema
 *
 * Reusable password validation schema that can be used across all modules.
 * Ensures consistent password validation throughout the application.
 *
 * Requirements:
 * - Minimum 8 characters
 * - Maximum 100 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 *
 * @example
 * ```ts
 * const registerSchema = z.object({
 *   email: emailSchema,
 *   password: passwordSchema,
 * });
 * ```
 */
export const passwordSchema = z
  .string("Password must be a string")
  .nonempty("Password is required")
  .min(8, "Password must be at least 8 characters")
  .max(100, "Password must be less than 100 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(
    /[^A-Za-z0-9]/,
    "Password must contain at least one special character",
  );

export const passwordSchemaOptional = passwordSchema.optional();

export type Password = z.infer<typeof passwordSchema>;
