import { z } from 'zod';

export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  username: z.string().min(3).max(30),
  createdAt: z.coerce.date().or(z.string().datetime()),
  updatedAt: z.coerce.date().or(z.string().datetime()),
});

export const userWithProfileSchema = userSchema.extend({
  avatarUrl: z.string().url().nullable().optional(),
});

export const minimalUserSchema = z.object({
  id: z.string().uuid(),
  username: z.string(),
  avatarUrl: z.string().url().nullable().optional(),
});

export const publicUserSchema = z.object({
  id: z.string().uuid(),
  username: z.string(),
  avatarUrl: z.string().url().nullable().optional(),
  createdAt: z.coerce.date().or(z.string().datetime()),
});

export const userProfileSchema = z.object({
  userId: z.string().uuid(),
  email: z.string().email(),
  username: z.string().optional(),
});

export type User = z.infer<typeof userSchema>;
export type UserWithProfile = z.infer<typeof userWithProfileSchema>;
export type MinimalUser = z.infer<typeof minimalUserSchema>;
export type PublicUser = z.infer<typeof publicUserSchema>;
export type UserProfile = z.infer<typeof userProfileSchema>;
