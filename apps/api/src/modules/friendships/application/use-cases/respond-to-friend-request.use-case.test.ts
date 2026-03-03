import { describe, expect, it } from "vitest";
import {
  ForbiddenError,
  NotFoundError,
} from "../../../../shared/errors/index.js";
import { Friendship } from "../../domain/entities/friendship.entity.js";
import {
  createMockedFriendshipsRepository,
  MOCK_FRIENDSHIP_ID,
  MOCK_USER_A_ID,
  MOCK_USER_B_ID,
  mockPendingFriendship,
} from "../../domain/interfaces/friendships.repository.mock.js";
import { RespondToFriendRequestUseCase } from "./respond-to-friend-request.use-case.js";

describe("RespondToFriendRequestUseCase", () => {
  it("accepts a pending friend request when called by the recipient", async () => {
    const acceptedFriendship = new Friendship({
      id: MOCK_FRIENDSHIP_ID,
      userId: MOCK_USER_A_ID,
      friendId: MOCK_USER_B_ID,
      status: "accepted",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    const friendshipsRepo = createMockedFriendshipsRepository({
      findById: async () => mockPendingFriendship,
      update: async () => acceptedFriendship,
    });
    const useCase = new RespondToFriendRequestUseCase(friendshipsRepo);

    // MOCK_USER_B_ID is the recipient (friendId)
    const result = await useCase.execute(
      MOCK_USER_B_ID,
      MOCK_FRIENDSHIP_ID,
      "accepted"
    );

    expect(result.status).toBe("accepted");
  });

  it("rejects a pending friend request when called by the recipient", async () => {
    const rejectedFriendship = new Friendship({
      id: MOCK_FRIENDSHIP_ID,
      userId: MOCK_USER_A_ID,
      friendId: MOCK_USER_B_ID,
      status: "rejected",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    const friendshipsRepo = createMockedFriendshipsRepository({
      findById: async () => mockPendingFriendship,
      update: async () => rejectedFriendship,
    });
    const useCase = new RespondToFriendRequestUseCase(friendshipsRepo);

    const result = await useCase.execute(
      MOCK_USER_B_ID,
      MOCK_FRIENDSHIP_ID,
      "rejected"
    );

    expect(result.status).toBe("rejected");
  });

  it("throws ForbiddenError when the sender tries to respond to their own request", async () => {
    const friendshipsRepo = createMockedFriendshipsRepository({
      findById: async () => mockPendingFriendship,
    });
    const useCase = new RespondToFriendRequestUseCase(friendshipsRepo);

    // MOCK_USER_A_ID is the sender (userId), not the recipient
    await expect(
      useCase.execute(MOCK_USER_A_ID, MOCK_FRIENDSHIP_ID, "accepted")
    ).rejects.toThrow(ForbiddenError);
  });

  it("throws NotFoundError when friendship does not exist", async () => {
    const friendshipsRepo = createMockedFriendshipsRepository({
      findById: async () => null,
    });
    const useCase = new RespondToFriendRequestUseCase(friendshipsRepo);

    await expect(
      useCase.execute(MOCK_USER_B_ID, "nonexistent-id", "accepted")
    ).rejects.toThrow(NotFoundError);
  });
});
