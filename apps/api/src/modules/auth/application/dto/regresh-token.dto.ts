import { z } from "zod";
import { refreshTokenSchema } from "../validators/refresh-token.validator";

export type RefreshTokenDTO = z.infer<typeof refreshTokenSchema>;
