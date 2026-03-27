import z from "zod";
import { uuidSchema } from "../../../../../shared/schemas/fields/uuid.schema";

export const typingEventValidator = z.object({
  conversationId: uuidSchema,
});

export type TypingEvent = z.infer<typeof typingEventValidator>;
