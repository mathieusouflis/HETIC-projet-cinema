import { vi } from "vitest";
import { Message } from "../entities/message.entity";
import type { IMessageRepository, MessagePage } from "./IMessageRepository";

export const MOCK_MESSAGE_ID = "11111111-1111-1111-1111-111111111111";
export const MOCK_CONVERSATION_ID = "22222222-2222-2222-2222-222222222222";
export const MOCK_AUTHOR_ID = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
export const MOCK_OTHER_USER_ID = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";

export const mockMessage = new Message({
  id: MOCK_MESSAGE_ID,
  conversationId: MOCK_CONVERSATION_ID,
  userId: MOCK_AUTHOR_ID,
  content: "Hello world",
  type: "text",
  createdAt: new Date().toISOString(),
  updatedAt: null,
  deletedAt: null,
});

export const mockDeletedMessage = new Message({
  id: MOCK_MESSAGE_ID,
  conversationId: MOCK_CONVERSATION_ID,
  userId: MOCK_AUTHOR_ID,
  content: "Hello world",
  type: "text",
  createdAt: new Date().toISOString(),
  updatedAt: null,
  deletedAt: new Date().toISOString(),
});

export const mockMessagePage: MessagePage = {
  items: [mockMessage],
  nextCursor: null,
  hasMore: false,
};

export function createMockedMessageRepository(
  overrides: Partial<IMessageRepository> = {}
): IMessageRepository {
  return {
    findByConversation: vi.fn().mockResolvedValue(mockMessagePage),
    findById: vi.fn().mockResolvedValue(mockMessage),
    create: vi.fn().mockResolvedValue(mockMessage),
    update: vi.fn().mockResolvedValue(mockMessage),
    softDelete: vi.fn().mockResolvedValue(mockDeletedMessage),
    ...overrides,
  };
}
