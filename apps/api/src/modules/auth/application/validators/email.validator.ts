import { z } from "zod";

/**
 * Email validation schema
 */
export const emailSchema = z
  .string({ required_error: "Email is required" })
  .email("Invalid email format")
  .max(255, "Email must be less than 255 characters")
  .toLowerCase()
  .trim();
