import z from "zod";
import { Shared } from "../../../../../shared";
import { publicUserValidator } from "../../../../users/application/validators";

export const refreshTokenResponseValidator = z.object({
  user: publicUserValidator,
  accessToken: Shared.Services.Token.Schemas.tokenSchema,
});

export type RefreshTokenResponse = z.infer<
  typeof refreshTokenResponseValidator
>;
