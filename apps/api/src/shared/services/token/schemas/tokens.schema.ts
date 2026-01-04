import { z } from "zod";

export const refreshTokenSchema = z
  .jwt()
  .describe("JWT refresh token for obtaining new access tokens");
export const tokenSchema = z
  .jwt()
  .describe("JWT access token for API authentication");

export const tokensSchema = z.object({
  accessToken: tokenSchema,
  refreshToken: refreshTokenSchema,
});

export const accessTokenSchema = z.object({
  accessToken: tokenSchema,
});

export const tokensWithMetadataSchema = tokensSchema.extend({
  expiresIn: z
    .number()
    .int()
    .positive()
    .describe("Access token expiration time in seconds"),
  tokenType: z.literal("Bearer").default("Bearer"),
});

export type Tokens = z.infer<typeof tokensSchema>;
export type AccessToken = z.infer<typeof accessTokenSchema>;
export type TokensWithMetadata = z.infer<typeof tokensWithMetadataSchema>;
export type RefreshToken = z.infer<typeof refreshTokenSchema>;
export type Token = z.infer<typeof tokenSchema>;
