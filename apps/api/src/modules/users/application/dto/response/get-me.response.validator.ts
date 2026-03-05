import z from "zod";
import { emailSchema } from "../../../../../shared/schemas/fields/email.schema";
import { usernameSchema } from "../../../../../shared/schemas/fields/username.schema";
import { uuidSchema } from "../../../../../shared/schemas/fields/uuid.schema";

export const getMeStatsSchema = z.object({
  totalSeriesHours: z.number().int().nonnegative(),
  totalMovieHours: z.number().int().nonnegative(),
  totalEpisodes: z.number().int().nonnegative(),
  totalMovies: z.number().int().nonnegative(),
});

export const getMeResponseSchema = z.object({
  userId: uuidSchema,
  email: emailSchema,
  username: usernameSchema,
  avatarUrl: z.string().url().nullable(),
  followersCount: z.number().int().nonnegative(),
  followingCount: z.number().int().nonnegative(),
  stats: getMeStatsSchema,
});

export type GetMeResponse = z.infer<typeof getMeResponseSchema>;
