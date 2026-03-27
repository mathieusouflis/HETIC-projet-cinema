import { vi } from "vitest";
import { Conversation } from "../entities/conversation.entity";
import type {
  ConversationWithMeta,
  IConversationRepository,
} from "./IConversationRepository";

export const MOCK_CONVERSATION_ID = "cccccccc-cccc-cccc-cccc-cccccccccccc";
export const MOCK_CONV_USER_A_ID = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
export const MOCK_CONV_USER_B_ID = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";

export const mockConversation = new Conversation({
  id: MOCK_CONVERSATION_ID,
  type: "direct",
  name: null,
  avatarUrl: null,
  createdBy: MOCK_CONV_USER_A_ID,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export const mockConversationWithMeta: ConversationWithMeta = Object.assign(
  Object.create(Object.getPrototypeOf(mockConversation)),
  mockConversation,
  {
    otherParticipant: {
      id: MOCK_CONV_USER_B_ID,
      username: "userB",
      avatarUrl: null,
    },
    lastMessage: null,
    unreadCount: 0,
  }
);

export function createMockedConversationRepository(
  overrides: Partial<IConversationRepository> = {}
): IConversationRepository {
  const defaults: IConversationRepository = {
    findAllForUser: vi.fn().mockResolvedValue([mockConversationWithMeta]),
    findByIdForUser: vi.fn().mockResolvedValue(mockConversationWithMeta),
    findById: vi.fn().mockResolvedValue(mockConversation),
    findDirectBetween: vi.fn().mockResolvedValue(null),
    create: vi.fn().mockResolvedValue(mockConversation),
    isParticipant: vi.fn().mockResolvedValue(true),
    markAsRead: vi.fn().mockResolvedValue(undefined),
  };

  return { ...defaults, ...overrides };
}
