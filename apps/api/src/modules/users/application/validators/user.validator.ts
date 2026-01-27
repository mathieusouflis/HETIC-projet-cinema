import { z } from "zod";

export const userValidator = z.object({
  id: z.uuid(),
  email: z.email(),
  username: z.string().min(3).max(30),
  createdAt: z.coerce.date().or(z.string().datetime()),
  updatedAt: z.coerce.date().or(z.string().datetime()),
});

export const userWithProfileValidator = userValidator.extend({
  avatarUrl: z.string().url().nullable().optional(),
});

export const minimalUserValidator = z.object({
  id: z.uuid(),
  username: z.string(),
  avatarUrl: z.url().nullable().optional(),
});

export const publicUserValidator = z.object({
  id: z.uuid(),
  username: z.string(),
  avatarUrl: z.string().url().nullable().optional(),
  createdAt: z.coerce.date().or(z.string().datetime()),
});

export const userProfileValidator = z.object({
  userId: z.uuid(),
  email: z.email(),
  username: z.string().optional(),
});

export type User = z.infer<typeof userValidator>;
export type UserWithProfile = z.infer<typeof userWithProfileValidator>;
export type MinimalUser = z.infer<typeof minimalUserValidator>;
export type PublicUser = z.infer<typeof publicUserValidator>;
export type UserProfile = z.infer<typeof userProfileValidator>;
