import z from "zod";
import { uuidSchema } from "../../../../../shared/schemas/fields/uuid.schema";

export const createConversationBodyValidator = z.object({
  friendId: uuidSchema,
});

export type CreateConversationBody = z.infer<
  typeof createConversationBodyValidator
>;
