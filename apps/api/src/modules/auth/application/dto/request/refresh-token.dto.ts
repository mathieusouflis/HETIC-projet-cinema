import { z } from "zod";
import { Shared } from "../../../../../shared";

export const refreshTokenRequestValidator = z.object({
  refreshToken: Shared.Services.Token.Schemas.refreshTokenSchema,
});

export type RefreshTokenDTO = z.infer<typeof refreshTokenRequestValidator>;
