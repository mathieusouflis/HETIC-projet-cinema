import z from "zod";

export const tokenValidator = z.jwt().describe('JWT access token for API authentication')

export type Token = z.infer<typeof tokenValidator>;
