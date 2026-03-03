import { describe, expect, it } from "vitest";
import {
  ForbiddenError,
  NotFoundError,
} from "../../../../shared/errors/index.js";
import { Message } from "../../domain/entities/message.entity.js";
import {
  createMockedMessageRepository,
  MOCK_AUTHOR_ID,
  MOCK_MESSAGE_ID,
  MOCK_OTHER_USER_ID,
  mockMessage,
} from "../../domain/interfaces/message.repository.mock.js";
import { EditMessageUseCase } from "./edit-message.use-case.js";

describe("EditMessageUseCase", () => {
  it("edits a message when the caller is the author", async () => {
    const editedMessage = new Message({
      ...mockMessage,
      content: "Updated content",
      createdAt: mockMessage.createdAt.toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
    });
    const messageRepo = createMockedMessageRepository({
      findById: async () => mockMessage,
      update: async () => editedMessage,
    });
    const useCase = new EditMessageUseCase(messageRepo);

    const result = await useCase.execute(
      MOCK_AUTHOR_ID,
      MOCK_MESSAGE_ID,
      "Updated content"
    );

    expect(result.content).toBe("Updated content");
  });

  it("throws ForbiddenError when the caller is not the author", async () => {
    const messageRepo = createMockedMessageRepository({
      findById: async () => mockMessage,
    });
    const useCase = new EditMessageUseCase(messageRepo);

    await expect(
      useCase.execute(MOCK_OTHER_USER_ID, MOCK_MESSAGE_ID, "Updated content")
    ).rejects.toThrow(ForbiddenError);
  });

  it("throws NotFoundError when message does not exist", async () => {
    const messageRepo = createMockedMessageRepository({
      findById: async () => null,
    });
    const useCase = new EditMessageUseCase(messageRepo);

    await expect(
      useCase.execute(MOCK_AUTHOR_ID, "nonexistent-id", "Updated content")
    ).rejects.toThrow(NotFoundError);
  });

  it("throws ForbiddenError when the message is soft-deleted", async () => {
    const messageRepo = createMockedMessageRepository({
      findById: async () => {
        return new Message({
          id: MOCK_MESSAGE_ID,
          conversationId: "conv-id",
          userId: MOCK_AUTHOR_ID,
          content: "old",
          type: "text",
          createdAt: new Date().toISOString(),
          updatedAt: null,
          deletedAt: new Date().toISOString(),
        });
      },
    });
    const useCase = new EditMessageUseCase(messageRepo);

    await expect(
      useCase.execute(MOCK_AUTHOR_ID, MOCK_MESSAGE_ID, "Updated content")
    ).rejects.toThrow(ForbiddenError);
  });
});
