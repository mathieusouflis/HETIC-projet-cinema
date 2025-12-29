import { z } from "zod";
import { passwordSchema } from "./password.validator";

/**
 * Schema for password change
 * Used in POST /auth/change-password endpoint
 */
export const changePasswordSchema = z.object({
  currentPassword: z
    .string({ required_error: "Current password is required" })
    .min(1, "Current password is required"),
  newPassword: passwordSchema,
});
