import { z } from "zod";

/**
 * Schema for token refresh
 * Used in POST /auth/refresh endpoint
 */
export const refreshTokenSchema = z.object({
  refreshToken: z
    .string({ required_error: "Refresh token is required" })
    .min(1, "Refresh token is required"),
});
