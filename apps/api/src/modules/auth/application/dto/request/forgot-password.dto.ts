import { z } from "zod";
import { emailSchema } from "../../../../../shared/schemas/fields/email.schema";

export const forgotPasswordValidator = z.object({
  email: emailSchema,
});

export type ForgotPasswordDTO = z.infer<typeof forgotPasswordValidator>;
