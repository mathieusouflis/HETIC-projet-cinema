import z from "zod";
import { tokenSchema } from "../../../../../shared/services/token/schemas/tokens.schema";
import { publicUserValidator } from "../../../../users/application/validators/user.validator";

export const refreshTokenResponseValidator = z.object({
  user: publicUserValidator,
  accessToken: tokenSchema,
});

export const refreshTokenResponseBodyValidator =
  refreshTokenResponseValidator.omit({ accessToken: true });

export type RefreshTokenResponse = z.infer<
  typeof refreshTokenResponseValidator
>;
