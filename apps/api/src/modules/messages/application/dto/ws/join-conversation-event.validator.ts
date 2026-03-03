import z from "zod";
import { uuidSchema } from "../../../../../shared/schemas/fields/index.js";

export const joinConversationEventValidator = z.object({
  conversationId: uuidSchema,
});

export type JoinConversationEvent = z.infer<
  typeof joinConversationEventValidator
>;
