import { z } from "zod";
import { emailSchema } from "./email.validator";
import { usernameSchema } from "./username.validator";
import { passwordSchema } from "./password.validator";

export const createUserSchema = z.object({
  email: emailSchema,
  username: usernameSchema,
  password: passwordSchema,
});
