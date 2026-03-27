import { z } from "zod";
import { refreshTokenSchema } from "../../../../../shared/services/token/schemas/tokens.schema";

export const refreshTokenRequestValidator = z.object({
  refreshToken: refreshTokenSchema,
});

export type RefreshTokenDTO = z.infer<typeof refreshTokenRequestValidator>;
