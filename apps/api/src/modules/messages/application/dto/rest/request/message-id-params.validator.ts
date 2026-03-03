import z from "zod";
import { uuidSchema } from "../../../../../../shared/schemas/fields/index.js";

export const messageIdParamsValidator = z.object({
  messageId: uuidSchema,
});

export type MessageIdParams = z.infer<typeof messageIdParamsValidator>;
