import z from "zod";
import { uuidSchema } from "../../../../../../shared/schemas/fields/index.js";

export const conversationIdParamsValidator = z.object({
  conversationId: uuidSchema,
});

export type ConversationIdParams = z.infer<
  typeof conversationIdParamsValidator
>;
