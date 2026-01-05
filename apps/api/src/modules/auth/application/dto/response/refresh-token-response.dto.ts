import z from "zod";
import { tokenSchema } from "../../../../../shared/services/token";

export const refreshTokenResponseDTO = tokenSchema;

export type RefreshTokenResponseDTO = z.infer<typeof refreshTokenResponseDTO>;
