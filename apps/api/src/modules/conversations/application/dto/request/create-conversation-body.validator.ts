import z from "zod";
import { uuidSchema } from "../../../../../shared/schemas/fields/index.js";

export const createConversationBodyValidator = z.object({
  friendId: uuidSchema,
});

export type CreateConversationBody = z.infer<
  typeof createConversationBodyValidator
>;
