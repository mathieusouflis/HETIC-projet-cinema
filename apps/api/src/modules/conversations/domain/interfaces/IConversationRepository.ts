import type { Conversation } from "../entities/conversation.entity.js";

export interface ConversationParticipantInfo {
  id: string;
  username: string;
  avatarUrl: string | null;
}

export interface LastMessageInfo {
  id: string;
  content: string | null;
  isDeleted: boolean;
  createdAt: Date;
  authorId: string;
}

export interface ConversationWithMeta extends Conversation {
  otherParticipant: ConversationParticipantInfo;
  lastMessage: LastMessageInfo | null;
  unreadCount: number;
}

export interface IConversationRepository {
  findAllForUser(userId: string): Promise<ConversationWithMeta[]>;
  findByIdForUser(
    conversationId: string,
    userId: string
  ): Promise<ConversationWithMeta | null>;
  findById(conversationId: string): Promise<Conversation | null>;
  findDirectBetween(userA: string, userB: string): Promise<Conversation | null>;
  create(
    createdBy: string,
    participantIds: [string, string]
  ): Promise<Conversation>;
  isParticipant(conversationId: string, userId: string): Promise<boolean>;
  markAsRead(conversationId: string, userId: string): Promise<void>;
}
