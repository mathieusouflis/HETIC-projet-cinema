import z from "zod";
import { uuidSchema } from "../../../../../../shared/schemas/fields/uuid.schema";

export const messageResponseSchema = z.object({
  id: uuidSchema,
  conversationId: uuidSchema,
  userId: uuidSchema,
  content: z.string().nullable(),
  type: z.string(),
  isDeleted: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date().nullable(),
  deletedAt: z.coerce.date().nullable(),
});

export const messagePageResponseSchema = z.object({
  items: messageResponseSchema.array(),
  nextCursor: z.string().nullable(),
  hasMore: z.boolean(),
});

export type MessageResponse = z.infer<typeof messageResponseSchema>;
export type MessagePageResponse = z.infer<typeof messagePageResponseSchema>;
