import { z } from "zod";
import { emailSchema } from "../../../../../shared/schemas/fields/email.schema";
import { passwordSchema } from "../../../../../shared/schemas/fields/password.schema";
import { usernameSchema } from "../../../../../shared/schemas/fields/username.schema";

export const registerValidator = z.object({
  email: emailSchema,
  username: usernameSchema,
  password: passwordSchema,
});

export type RegisterDTO = z.infer<typeof registerValidator>;
