import type z from "zod";
import { Shared } from "../../../../../shared";

export const refreshTokenResponseDTO =
  Shared.Services.Token.Schemas.tokenSchema;

export type RefreshTokenResponseDTO = z.infer<typeof refreshTokenResponseDTO>;
