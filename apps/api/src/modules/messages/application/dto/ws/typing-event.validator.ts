import z from "zod";
import { uuidSchema } from "../../../../../shared/schemas/fields/index.js";

export const typingEventValidator = z.object({
  conversationId: uuidSchema,
});

export type TypingEvent = z.infer<typeof typingEventValidator>;
