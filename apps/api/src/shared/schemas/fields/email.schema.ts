import { z } from "zod";

export const emailSchema = z
  .email("Invalid email format")
  .nonempty("Email is required")
  .max(255, "Email must be less than 255 characters")
  .toLowerCase()
  .trim();

export const emailSchemaOptional = emailSchema.optional();

export type Email = z.infer<typeof emailSchema>;
