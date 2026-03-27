import { describe, expect, it, vi } from "vitest";
import { ConflictError } from "../../../../shared/errors/conflict-error";
import { ForbiddenError } from "../../../../shared/errors/forbidden-error";
import { NotFoundError } from "../../../../shared/errors/not-found-error";
import { createMockedUserRepository } from "../../../users/domain/interfaces/user.repository.mock.";
import {
  createMockedFriendshipsRepository,
  MOCK_USER_A_ID,
  MOCK_USER_B_ID,
  mockPendingFriendship,
} from "../../domain/interfaces/friendships.repository.mock";
import { SendFriendRequestUseCase } from "./send-friend-request.use-case";

describe("SendFriendRequestUseCase", () => {
  it("creates a pending friendship when target user exists", async () => {
    const friendshipsRepo = createMockedFriendshipsRepository({
      findByUserAndFriend: async () => null,
    });
    const userRepo = createMockedUserRepository({
      findById: vi.fn().mockResolvedValue({ id: MOCK_USER_B_ID }),
    });
    const useCase = new SendFriendRequestUseCase(userRepo, friendshipsRepo);

    const result = await useCase.execute(MOCK_USER_A_ID, MOCK_USER_B_ID);

    expect(result.status).toBe("pending");
    expect(result.userId).toBe(MOCK_USER_A_ID);
    expect(result.friendId).toBe(MOCK_USER_B_ID);
  });

  it("throws ForbiddenError when user tries to friend themselves", async () => {
    const friendshipsRepo = createMockedFriendshipsRepository();
    const userRepo = createMockedUserRepository();
    const useCase = new SendFriendRequestUseCase(userRepo, friendshipsRepo);

    await expect(
      useCase.execute(MOCK_USER_A_ID, MOCK_USER_A_ID)
    ).rejects.toThrow(ForbiddenError);
  });

  it("throws NotFoundError when target user does not exist", async () => {
    const friendshipsRepo = createMockedFriendshipsRepository();
    const userRepo = createMockedUserRepository({
      findById: async () => null,
    });
    const useCase = new SendFriendRequestUseCase(userRepo, friendshipsRepo);

    await expect(
      useCase.execute(MOCK_USER_A_ID, "nonexistent-id")
    ).rejects.toThrow(NotFoundError);
  });

  it("throws ConflictError when friendship already exists", async () => {
    const friendshipsRepo = createMockedFriendshipsRepository({
      findByUserAndFriend: async () => mockPendingFriendship,
    });
    const userRepo = createMockedUserRepository({
      findById: vi.fn().mockResolvedValue({ id: MOCK_USER_B_ID }),
    });
    const useCase = new SendFriendRequestUseCase(userRepo, friendshipsRepo);

    await expect(
      useCase.execute(MOCK_USER_A_ID, MOCK_USER_B_ID)
    ).rejects.toThrow(ConflictError);
  });
});
