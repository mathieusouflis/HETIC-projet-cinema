import z from "zod";
import { uuidSchema } from "../../../../../shared/schemas/fields/index.js";

export const conversationParamsValidator = z.object({
  id: uuidSchema,
});

export type ConversationParams = z.infer<typeof conversationParamsValidator>;
