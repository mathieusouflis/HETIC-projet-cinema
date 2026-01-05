import { z } from "zod";
import { emailSchema } from "../../../../../shared/schemas";

export const loginValidator = z.object({
  email: emailSchema,
  password: z.string(),
});

export type LoginDTO = z.infer<typeof loginValidator>;
