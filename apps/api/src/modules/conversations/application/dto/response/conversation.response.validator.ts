import z from "zod";
import {
  uuidSchema,
  uuidSchemaNullable,
} from "../../../../../shared/schemas/fields/uuid.schema";

export const participantInfoSchema = z.object({
  id: uuidSchema,
  username: z.string(),
  avatarUrl: z.string().nullable(),
});

export const lastMessageSchema = z.object({
  id: uuidSchema,
  content: z.string().nullable(),
  isDeleted: z.boolean(),
  createdAt: z.coerce.date(),
  authorId: uuidSchema,
});

export const conversationResponseSchema = z.object({
  id: uuidSchema,
  type: z.literal("direct"),
  name: z.string().nullable(),
  avatarUrl: z.string().nullable(),
  createdBy: uuidSchemaNullable,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  otherParticipant: participantInfoSchema,
  lastMessage: lastMessageSchema.nullable(),
  unreadCount: z.number().int().nonnegative(),
});

export const conversationBasicSchema = z.object({
  id: uuidSchema,
  type: z.literal("direct"),
  name: z.string().nullable(),
  avatarUrl: z.string().nullable(),
  createdBy: uuidSchemaNullable,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type ConversationResponse = z.infer<typeof conversationResponseSchema>;
export type ConversationBasicResponse = z.infer<typeof conversationBasicSchema>;
