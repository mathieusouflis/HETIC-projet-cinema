import { z } from "zod";
import { Shared } from "../../../../../shared";
import { publicUserValidator } from "../../../../users/application/validators/user.validator";

export const authResponseDataValidator = z.object({
  user: publicUserValidator,
  accessToken: Shared.Services.Token.Schemas.tokenSchema,
});

export type AuthResponse = z.infer<typeof authResponseDataValidator>;
