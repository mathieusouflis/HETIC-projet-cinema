import z from "zod";
import {
  uuidSchema,
  uuidSchemaNullable,
} from "../../../../shared/schemas/fields/uuid.schema";

export const watchpartyStatusSchema = z.enum([
  "scheduled",
  "active",
  "ended",
  "cancelled",
]);

export const watchpartySchema = z.object({
  id: uuidSchema,
  createdBy: uuidSchema,
  contentId: uuidSchema,
  seasonId: uuidSchemaNullable,
  episodeId: uuidSchemaNullable,
  name: z.string().min(1).max(255),
  description: z.string().nullable(),
  isPublic: z.boolean(),
  maxParticipants: z.number().int().positive().nullable(),
  platformId: uuidSchemaNullable,
  platformUrl: z.url().nullable(),
  scheduledAt: z.date().nullable(),
  startedAt: z.date().nullable(),
  endedAt: z.date().nullable(),
  status: watchpartyStatusSchema,
  currentPositionTimestamp: z.number().int().nonnegative().nullable(),
  isPlaying: z.boolean(),
  leaderUserId: uuidSchemaNullable,
  createdAt: z.date(),
  updatedAt: z.date(),
});
