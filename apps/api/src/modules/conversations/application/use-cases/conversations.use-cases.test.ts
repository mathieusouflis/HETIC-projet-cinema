// @ts-nocheck
import { describe, expect, it, vi } from "vitest";
import {
  ForbiddenError,
  NotFoundError,
} from "../../../../shared/errors/index.js";
import { GetConversationUseCase } from "./get-conversation.use-case.js";
import { GetConversationsUseCase } from "./get-conversations.use-case.js";
import { MarkConversationReadUseCase } from "./mark-conversation-read.use-case.js";

describe("conversations use-cases", () => {
  it("get conversation handles forbidden and not found", async () => {
    const repo = {
      findByIdForUser: vi.fn(),
      findById: vi.fn(),
      findAllForUser: vi.fn().mockResolvedValue([{ id: "c1" }]),
      isParticipant: vi.fn(),
      markAsRead: vi.fn(),
    };
    const getOne = new GetConversationUseCase(repo as never);

    repo.findByIdForUser.mockResolvedValueOnce(null);
    repo.findById.mockResolvedValueOnce({ id: "c1" });
    await expect(getOne.execute("u1", "c1")).rejects.toBeInstanceOf(
      ForbiddenError
    );

    repo.findByIdForUser.mockResolvedValueOnce(null);
    repo.findById.mockResolvedValueOnce(null);
    await expect(getOne.execute("u1", "c1")).rejects.toBeInstanceOf(
      NotFoundError
    );

    repo.findByIdForUser.mockResolvedValueOnce({ id: "c1" });
    await expect(getOne.execute("u1", "c1")).resolves.toEqual({ id: "c1" });

    await expect(
      new GetConversationsUseCase(repo as never).execute("u1")
    ).resolves.toHaveLength(1);
  });

  it("mark conversation read validates participation", async () => {
    const repo = {
      isParticipant: vi
        .fn()
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(true),
      markAsRead: vi.fn().mockResolvedValue(undefined),
    };
    const useCase = new MarkConversationReadUseCase(repo as never);
    await expect(useCase.execute("u1", "c1")).rejects.toBeInstanceOf(
      ForbiddenError
    );
    await expect(useCase.execute("u1", "c1")).resolves.toBeUndefined();
    expect(repo.markAsRead).toHaveBeenCalledWith("c1", "u1");
  });
});
