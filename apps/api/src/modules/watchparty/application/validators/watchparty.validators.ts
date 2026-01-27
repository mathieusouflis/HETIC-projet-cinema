import z from "zod";
import { uuidSchema } from "../../../../shared/schemas/fields/index.js";

export const watchpartyStatusSchema = z.enum([
  "scheduled",
  "active",
  "ended",
  "cancelled"
]);

export const watchpartySchema = z.object({
  id: uuidSchema,
  createdBy: uuidSchema,
  contentId: uuidSchema,
  seasonId: uuidSchema.nullable(),
  episodeId: uuidSchema.nullable(),
  name: z.string().min(1).max(255),
  description: z.string().nullable(),
  isPublic: z.boolean(),
  maxParticipants: z.number().int().positive().nullable(),
  platformId: uuidSchema.nullable(),
  platformUrl: z.url().nullable(),
  scheduledAt: z.date().nullable(),
  startedAt: z.date().nullable(),
  endedAt: z.date().nullable(),
  status: watchpartyStatusSchema,
  currentPositionTimestamp: z.number().int().nonnegative().nullable(),
  isPlaying: z.boolean(),
  leaderUserId: uuidSchema.nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
