import { z } from "zod";
import { Shared } from "../../../../../shared";

export const registerValidator = z.object({
  email: Shared.Schemas.Fields.emailSchema,
  username: Shared.Schemas.Fields.usernameSchema,
  password: Shared.Schemas.Fields.passwordSchema,
});

export type RegisterDTO = z.infer<typeof registerValidator>;
