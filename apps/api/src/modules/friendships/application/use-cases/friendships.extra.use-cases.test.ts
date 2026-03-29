import { describe, expect, it, vi } from "vitest";
import { ForbiddenError } from "../../../../shared/errors/forbidden-error.js";
import { NotFoundError } from "../../../../shared/errors/not-found-error.js";
import { GetMyFriendshipsUseCase } from "./get-my-friendships.use-case.js";
import { RemoveFriendshipUseCase } from "./remove-friendship.use-case.js";

describe("friendships extra use-cases", () => {
  it("getMyFriendships delegates to repository", async () => {
    const repo = { findAllForUser: vi.fn().mockResolvedValue([{ id: "f1" }]) };
    await expect(
      new GetMyFriendshipsUseCase(repo as never).execute(
        "u1",
        "accepted" as never
      )
    ).resolves.toHaveLength(1);
  });

  it("removeFriendship validates ownership", async () => {
    const repo = {
      findById: vi.fn(),
      delete: vi.fn().mockResolvedValue(undefined),
    };
    const useCase = new RemoveFriendshipUseCase(repo as never);

    repo.findById.mockResolvedValueOnce(null);
    await expect(useCase.execute("u1", "f1")).rejects.toBeInstanceOf(
      NotFoundError
    );

    repo.findById.mockResolvedValueOnce({ isParticipant: () => false });
    await expect(useCase.execute("u1", "f1")).rejects.toBeInstanceOf(
      ForbiddenError
    );

    repo.findById.mockResolvedValueOnce({ isParticipant: () => true });
    await expect(useCase.execute("u1", "f1")).resolves.toBeUndefined();
  });
});
