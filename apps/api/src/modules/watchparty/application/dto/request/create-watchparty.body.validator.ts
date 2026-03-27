import z from "zod";
import {
  uuidSchema,
  uuidSchemaOptional,
} from "../../../../../shared/schemas/fields/uuid.schema";
import { watchpartyStatusSchema } from "../../validators/watchparty.validators";

export const createWatchpartyBodyValidator = z.object({
  contentId: uuidSchema,
  seasonId: uuidSchemaOptional,
  episodeId: uuidSchemaOptional,
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  isPublic: z.boolean().default(false),
  maxParticipants: z.number().positive().optional(),
  platformId: uuidSchema,
  platformUrl: z.url(),
  scheduledAt: z.coerce.date(),
  status: watchpartyStatusSchema.optional(),
});

export type CreateWatchpartyBody = z.infer<
  typeof createWatchpartyBodyValidator
>;
