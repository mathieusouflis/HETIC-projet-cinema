import { z } from "zod";
import { Shared } from "../../../../../shared/index.js";

export const resetPasswordValidator = z.object({
  token: z.string().min(1, "Token is required"),
  newPassword: Shared.Schemas.Fields.passwordSchema,
});

export type ResetPasswordDTO = z.infer<typeof resetPasswordValidator>;
