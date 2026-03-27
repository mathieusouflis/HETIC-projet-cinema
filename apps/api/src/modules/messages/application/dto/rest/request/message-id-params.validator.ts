import z from "zod";
import { uuidSchema } from "../../../../../../shared/schemas/fields/uuid.schema";

export const messageIdParamsValidator = z.object({
  messageId: uuidSchema,
});

export type MessageIdParams = z.infer<typeof messageIdParamsValidator>;
