import z from "zod";
import { uuidSchema } from "../../../../../../shared/schemas/fields/uuid.schema";

export const conversationIdParamsValidator = z.object({
  conversationId: uuidSchema,
});

export type ConversationIdParams = z.infer<
  typeof conversationIdParamsValidator
>;
