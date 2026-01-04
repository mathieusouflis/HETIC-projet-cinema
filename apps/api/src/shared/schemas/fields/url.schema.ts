import { z } from "zod";

export const urlSchema = z
  .string("URL must be a string")
  .nonempty("URL is required")
  .url("Invalid URL format")
  .max(2048, "URL must be less than 2048 characters");

export const urlSchemaOptional = urlSchema.optional();

export const urlSchemaNullable = urlSchema.nullable();

export const urlSchemaOptionalNullable = urlSchema.optional().nullable();

/**
 * Avatar URL Schema with specific constraints
 *
 * More restrictive than general URL Schema:
 * - Max 500 characters (instead of 2048)
 * - Common use case for profile avatars
 */
export const avatarUrlSchema = z
  .string()
  .url("Avatar must be a valid URL")
  .max(500, "Avatar URL must be less than 500 characters");

export const avatarUrlSchemaOptional = avatarUrlSchema.optional();

export const avatarUrlSchemaNullable = avatarUrlSchema.nullable();

export const avatarUrlSchemaOptionalNullable = avatarUrlSchema
  .optional()
  .nullable();

export type Url = z.infer<typeof urlSchema>;
export type AvatarUrl = z.infer<typeof avatarUrlSchema>;
