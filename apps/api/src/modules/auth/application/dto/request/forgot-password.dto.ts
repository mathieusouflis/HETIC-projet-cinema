import { z } from "zod";
import { Shared } from "../../../../../shared/index.js";

export const forgotPasswordValidator = z.object({
  email: Shared.Schemas.Fields.emailSchema,
});

export type ForgotPasswordDTO = z.infer<typeof forgotPasswordValidator>;
