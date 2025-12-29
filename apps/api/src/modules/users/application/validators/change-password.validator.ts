import { z } from "zod";
import { passwordSchema } from "./password.validator";

export const changePasswordSchema = z.object({
  currentPassword: z.string({ required_error: "Current password is required" }),
  newPassword: passwordSchema,
});
