import type z from "zod";
import { Shared } from "../../../../../shared";

export const refreshTokenResponseValidator =
  Shared.Services.Token.Schemas.tokenSchema;

export type RefreshTokenResponse = z.infer<
  typeof refreshTokenResponseValidator
>;
