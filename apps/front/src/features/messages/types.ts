export interface Participant {
  id: string;
  username: string;
  avatarUrl: string | null;
}

export interface LastMessage {
  id: string;
  content: string | null; // null when soft-deleted
  isDeleted: boolean;
  createdAt: string | null;
  authorId: string;
}

export interface Conversation {
  id: string;
  type: "direct";
  name: string | null;
  avatarUrl: string | null;
  createdBy: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  otherParticipant: Participant;
  lastMessage: LastMessage | null;
  unreadCount: number;
}

export interface Message {
  id: string;
  conversationId: string;
  userId: string;
  content: string | null; // null when soft-deleted
  type: string;
  isDeleted: boolean;
  createdAt: string | null;
  updatedAt: string | null;
  deletedAt: string | null;
}

export interface MessagePage {
  items: Message[];
  nextCursor: string | null;
  hasMore: boolean;
}

export type ConversationFilter = "all" | "unread" | "groups";

export const CONVERSATION_FILTER_LABELS: Record<ConversationFilter, string> = {
  all: "All",
  unread: "Unread",
  groups: "Groups",
};
