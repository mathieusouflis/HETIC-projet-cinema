import z from "zod";
import { tokensSchema } from "../../../../../shared/services/token";

export const refreshTokenResponseDTO = tokensSchema;

export type RefreshTokenResponseDTO = z.infer<typeof refreshTokenResponseDTO>;
