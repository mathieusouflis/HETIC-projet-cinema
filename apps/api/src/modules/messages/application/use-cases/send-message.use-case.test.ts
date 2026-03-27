import { describe, expect, it } from "vitest";
import { ForbiddenError } from "../../../../shared/errors/forbidden-error";
import { createMockedConversationRepository } from "../../../conversations/domain/interfaces/conversation.repository.mock";
import {
  createMockedMessageRepository,
  MOCK_AUTHOR_ID,
  MOCK_CONVERSATION_ID,
  MOCK_OTHER_USER_ID,
  mockMessage,
} from "../../domain/interfaces/message.repository.mock";
import { SendMessageUseCase } from "./send-message.use-case";

describe("SendMessageUseCase", () => {
  it("sends a message when the caller is a participant", async () => {
    const messageRepo = createMockedMessageRepository({
      create: async () => mockMessage,
    });
    const conversationRepo = createMockedConversationRepository({
      isParticipant: async () => true,
    });
    const useCase = new SendMessageUseCase(messageRepo, conversationRepo);

    const result = await useCase.execute(
      MOCK_AUTHOR_ID,
      MOCK_CONVERSATION_ID,
      "Hello world"
    );

    expect(result.content).toBe("Hello world");
    expect(result.userId).toBe(MOCK_AUTHOR_ID);
  });

  it("throws ForbiddenError when the caller is not a participant", async () => {
    const messageRepo = createMockedMessageRepository();
    const conversationRepo = createMockedConversationRepository({
      isParticipant: async () => false,
    });
    const useCase = new SendMessageUseCase(messageRepo, conversationRepo);

    await expect(
      useCase.execute(MOCK_OTHER_USER_ID, MOCK_CONVERSATION_ID, "Hi")
    ).rejects.toThrow(ForbiddenError);
  });
});
