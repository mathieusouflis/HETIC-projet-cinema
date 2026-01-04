import { z } from "zod";
import {
  emailSchema,
  passwordSchema,
  usernameSchema,
} from "../../../../../shared/schemas";

export const registerValidator = z.object({
  email: emailSchema,
  username: usernameSchema,
  password: passwordSchema,
});

export type RegisterDTO = z.infer<typeof registerValidator>;
