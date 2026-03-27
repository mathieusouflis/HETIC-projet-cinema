import z from "zod";
import { uuidSchema } from "../../../../../shared/schemas/fields/uuid.schema";

export const conversationParamsValidator = z.object({
  id: uuidSchema,
});

export type ConversationParams = z.infer<typeof conversationParamsValidator>;
