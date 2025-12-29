import { z } from "zod";
import { emailSchema } from "./email.validator";

/**
 * Schema for user login
 * Used in POST /auth/login endpoint
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z
    .string({ required_error: "Password is required" })
    .min(1, "Password is required"),
});
