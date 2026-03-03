import { describe, expect, it, vi } from "vitest";
import {
  ForbiddenError,
  NotFoundError,
} from "../../../../shared/errors/index.js";
import {
  createMockedFriendshipsRepository,
  mockAcceptedFriendship,
} from "../../../friendships/domain/interfaces/friendships.repository.mock.js";
import { createMockedUserRepository } from "../../../users/domain/interfaces/user.repository.mock..js";
import {
  createMockedConversationRepository,
  MOCK_CONV_USER_A_ID,
  MOCK_CONV_USER_B_ID,
  MOCK_CONVERSATION_ID,
  mockConversation,
} from "../../domain/interfaces/conversation.repository.mock.js";
import { CreateConversationUseCase } from "./create-conversation.use-case.js";

describe("CreateConversationUseCase", () => {
  it("creates a new direct conversation when friendship is accepted", async () => {
    const conversationRepo = createMockedConversationRepository({
      findDirectBetween: vi.fn().mockResolvedValue(null),
    });
    const friendshipsRepo = createMockedFriendshipsRepository({
      findAccepted: vi.fn().mockResolvedValue(mockAcceptedFriendship),
    });
    const userRepo = createMockedUserRepository({
      findById: vi.fn().mockResolvedValue({ id: MOCK_CONV_USER_B_ID }),
    });
    const useCase = new CreateConversationUseCase(
      conversationRepo,
      friendshipsRepo,
      userRepo
    );

    const result = await useCase.execute(
      MOCK_CONV_USER_A_ID,
      MOCK_CONV_USER_B_ID
    );

    expect(result.id).toBe(MOCK_CONVERSATION_ID);
    expect(result.type).toBe("direct");
  });

  it("returns existing conversation instead of creating a duplicate", async () => {
    const conversationRepo = createMockedConversationRepository({
      findDirectBetween: vi.fn().mockResolvedValue(mockConversation),
    });
    const friendshipsRepo = createMockedFriendshipsRepository({
      findAccepted: vi.fn().mockResolvedValue(mockAcceptedFriendship),
    });
    const userRepo = createMockedUserRepository({
      findById: vi.fn().mockResolvedValue({ id: MOCK_CONV_USER_B_ID }),
    });
    const useCase = new CreateConversationUseCase(
      conversationRepo,
      friendshipsRepo,
      userRepo
    );

    const result = await useCase.execute(
      MOCK_CONV_USER_A_ID,
      MOCK_CONV_USER_B_ID
    );

    expect(result.id).toBe(MOCK_CONVERSATION_ID);
    expect(conversationRepo.create).not.toHaveBeenCalled();
  });

  it("throws ForbiddenError when friendship is not accepted", async () => {
    const conversationRepo = createMockedConversationRepository();
    const friendshipsRepo = createMockedFriendshipsRepository({
      findAccepted: vi.fn().mockResolvedValue(null),
    });
    const userRepo = createMockedUserRepository({
      findById: vi.fn().mockResolvedValue({ id: MOCK_CONV_USER_B_ID }),
    });
    const useCase = new CreateConversationUseCase(
      conversationRepo,
      friendshipsRepo,
      userRepo
    );

    await expect(
      useCase.execute(MOCK_CONV_USER_A_ID, MOCK_CONV_USER_B_ID)
    ).rejects.toThrow(ForbiddenError);
  });

  it("throws ForbiddenError when caller tries to DM themselves", async () => {
    const conversationRepo = createMockedConversationRepository();
    const friendshipsRepo = createMockedFriendshipsRepository();
    const userRepo = createMockedUserRepository();
    const useCase = new CreateConversationUseCase(
      conversationRepo,
      friendshipsRepo,
      userRepo
    );

    await expect(
      useCase.execute(MOCK_CONV_USER_A_ID, MOCK_CONV_USER_A_ID)
    ).rejects.toThrow(ForbiddenError);
  });

  it("throws NotFoundError when friendId does not exist", async () => {
    const conversationRepo = createMockedConversationRepository();
    const friendshipsRepo = createMockedFriendshipsRepository();
    const userRepo = createMockedUserRepository({
      findById: vi.fn().mockResolvedValue(null),
    });
    const useCase = new CreateConversationUseCase(
      conversationRepo,
      friendshipsRepo,
      userRepo
    );

    await expect(
      useCase.execute(MOCK_CONV_USER_A_ID, "nonexistent-id")
    ).rejects.toThrow(NotFoundError);
  });
});
