import { z } from "zod";
import { passwordSchema } from "../../../../../shared/schemas/fields/password.schema";

export const resetPasswordValidator = z.object({
  token: z.string().min(1, "Token is required"),
  newPassword: passwordSchema,
});

export type ResetPasswordDTO = z.infer<typeof resetPasswordValidator>;
