import z from "zod";
import { uuidSchemaOptional } from "../../../../../shared/schemas/fields/uuid.schema";
import { watchpartyStatusSchema } from "../../validators/watchparty.validators";

export const updateWatchpartyBodyValidator = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  isPublic: z.boolean().optional(),
  maxParticipants: z.number().positive().optional(),
  platformId: uuidSchemaOptional,
  platformUrl: z.url().optional(),
  scheduledAt: z.coerce.date().optional(),
  startedAt: z.coerce.date().optional(),
  endedAt: z.coerce.date().optional(),
  status: watchpartyStatusSchema.optional(),
  currentPositionTimestamp: z.number().nonnegative().optional(),
  isPlaying: z.boolean().optional(),
  leaderUserId: uuidSchemaOptional,
});

export type UpdateWatchpartyBody = z.infer<
  typeof updateWatchpartyBodyValidator
>;
