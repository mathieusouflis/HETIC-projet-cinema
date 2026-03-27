import z from "zod";
import { uuidSchema } from "../../../../../shared/schemas/fields/uuid.schema";

export const sendMessageEventValidator = z.object({
  conversationId: uuidSchema,
  content: z.string().min(1).max(4000),
});

export type SendMessageEvent = z.infer<typeof sendMessageEventValidator>;
