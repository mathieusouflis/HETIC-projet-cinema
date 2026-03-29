import { describe, expect, it, vi } from "vitest";
import { ForbiddenError } from "../../../../shared/errors/forbidden-error.js";
import { NotFoundError } from "../../../../shared/errors/not-found-error.js";
import { DeleteMessageUseCase } from "./delete-message.use-case.js";
import { GetMessagesUseCase } from "./get-messages.use-case.js";

describe("messages extra use-cases", () => {
  it("getMessages validates participant", async () => {
    const conversationRepo = {
      isParticipant: vi
        .fn()
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(true),
    };
    const messageRepo = {
      findByConversation: vi
        .fn()
        .mockResolvedValue({ items: [], hasMore: false }),
    };
    const useCase = new GetMessagesUseCase(
      messageRepo as never,
      conversationRepo as never
    );

    await expect(useCase.execute("u1", "c1")).rejects.toBeInstanceOf(
      ForbiddenError
    );
    await expect(useCase.execute("u1", "c1")).resolves.toEqual({
      items: [],
      hasMore: false,
    });
  });

  it("deleteMessage validates author", async () => {
    const messageRepo = {
      findById: vi.fn(),
      softDelete: vi.fn().mockResolvedValue({ id: "m1", isDeleted: true }),
    };
    const useCase = new DeleteMessageUseCase(messageRepo as never);

    messageRepo.findById.mockResolvedValueOnce(null);
    await expect(useCase.execute("u1", "m1")).rejects.toBeInstanceOf(
      NotFoundError
    );
    messageRepo.findById.mockResolvedValueOnce({ isAuthor: () => false });
    await expect(useCase.execute("u1", "m1")).rejects.toBeInstanceOf(
      ForbiddenError
    );
    messageRepo.findById.mockResolvedValueOnce({ isAuthor: () => true });
    await expect(useCase.execute("u1", "m1")).resolves.toMatchObject({
      isDeleted: true,
    });
  });
});
