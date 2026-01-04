import { z } from "zod";
import { emailSchema, passwordSchema } from "../../../../../shared/schemas";

export const loginValidator = z.object({
  email: emailSchema,
  password: passwordSchema
});

export type LoginDTO = z.infer<typeof loginValidator>;
