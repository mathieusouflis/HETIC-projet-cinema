import { z } from "zod";
import { emailSchema } from "./email.validator";
import { usernameSchema } from "./username.validator";
import { passwordSchema } from "./password.validator";

/**
 * Schema for user registration
 * Used in POST /auth/register endpoint
 */
export const registerSchema = z.object({
  email: emailSchema,
  username: usernameSchema,
  password: passwordSchema,
});
