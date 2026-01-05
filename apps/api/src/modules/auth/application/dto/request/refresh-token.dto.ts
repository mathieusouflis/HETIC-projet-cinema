import { z } from "zod";
import { refreshTokenSchema } from "../../../../../shared/services/token";

export const refreshTokenRequestValidator = z.object({
  refreshToken: refreshTokenSchema,
});

export type RefreshTokenDTO = z.infer<typeof refreshTokenRequestValidator>;
