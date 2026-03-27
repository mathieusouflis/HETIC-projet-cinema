import { z } from "zod";
import { tokenSchema } from "../../../../../shared/services/token/schemas/tokens.schema";
import { publicUserValidator } from "../../../../users/application/validators/user.validator";

export const authResponseDataValidator = z.object({
  user: publicUserValidator,
  accessToken: tokenSchema,
});

export const authResponseBodyValidator = authResponseDataValidator.omit({
  accessToken: true,
});

export type AuthResponse = z.infer<typeof authResponseDataValidator>;
