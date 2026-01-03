import z from "zod";

export const refreshTokenValidator = z.jwt().describe('JWT refresh token for obtaining new access tokens')

export type RefreshToken = z.infer<typeof refreshTokenValidator>;
