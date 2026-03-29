import { describe, expect, it, vi } from "vitest";
import { NotFoundError } from "../../../../shared/errors/not-found-error.js";
import { UnauthorizedError } from "../../../../shared/errors/unauthorized-error.js";
import { CreateWatchpartyUseCase } from "./create-watchparty.use-case.js";
import { DeleteWatchpartyUseCase } from "./delete-watchparty.use-case.js";
import { GetWatchpartyUseCase } from "./get-watchparty.use-case.js";
import { ListWatchpartiesUseCase } from "./list-watchparties.use-case.js";
import { UpdateWatchpartyUseCase } from "./update-watchparty.use-case.js";

const watchparty = {
  id: "w1",
  isCreator: (id: string) => id === "u1",
  isLeader: (id: string) => id === "u1",
};

describe("watchparty use-cases", () => {
  it("create handles content missing/success/not created", async () => {
    const watchpartyRepository = { create: vi.fn() };
    const contentRepository = { getContentById: vi.fn() };
    const useCase = new CreateWatchpartyUseCase(
      watchpartyRepository as never,
      contentRepository as never
    );
    const body = {
      contentId: "c1",
      scheduledAt: new Date(),
      name: "party",
      platformId: "p1",
      platformUrl: "url",
    };

    contentRepository.getContentById.mockResolvedValueOnce(undefined);
    await expect(useCase.execute("u1", body as never)).rejects.toBeInstanceOf(
      NotFoundError
    );

    contentRepository.getContentById.mockResolvedValue({ id: "c1" });
    watchpartyRepository.create.mockResolvedValueOnce(undefined);
    await expect(useCase.execute("u1", body as never)).rejects.toBeInstanceOf(
      NotFoundError
    );

    watchpartyRepository.create.mockResolvedValue(watchparty);
    await expect(useCase.execute("u1", body as never)).resolves.toBe(
      watchparty
    );
  });

  it("get and delete validate not found / auth", async () => {
    const repository = {
      findById: vi.fn(),
      delete: vi.fn(),
    };
    const getUseCase = new GetWatchpartyUseCase(repository as never);
    const delUseCase = new DeleteWatchpartyUseCase(repository as never);

    repository.findById.mockResolvedValueOnce(null);
    await expect(getUseCase.execute("x")).rejects.toBeInstanceOf(NotFoundError);

    repository.findById.mockResolvedValueOnce(watchparty);
    await expect(getUseCase.execute("x")).resolves.toBe(watchparty);

    repository.findById.mockResolvedValueOnce(null);
    await expect(delUseCase.execute("u1", "w1")).rejects.toBeInstanceOf(
      NotFoundError
    );

    repository.findById.mockResolvedValueOnce({
      ...watchparty,
      isCreator: () => false,
    });
    await expect(delUseCase.execute("u2", "w1")).rejects.toBeInstanceOf(
      UnauthorizedError
    );

    repository.findById.mockResolvedValueOnce(watchparty);
    await expect(delUseCase.execute("u1", "w1")).resolves.toBeUndefined();
  });

  it("list and update flow", async () => {
    const repository = {
      list: vi.fn().mockResolvedValue({ data: [watchparty], total: 1 }),
      findById: vi.fn(),
      update: vi.fn(),
    };
    const listUseCase = new ListWatchpartiesUseCase(repository as never);
    const updateUseCase = new UpdateWatchpartyUseCase(repository as never);

    const listResult = await listUseCase.execute({
      page: 1,
      limit: 10,
    } as never);
    expect(listResult.data.items).toHaveLength(1);

    repository.findById.mockResolvedValueOnce(null);
    await expect(
      updateUseCase.execute("u1", "w1", {} as never)
    ).rejects.toBeInstanceOf(NotFoundError);

    repository.findById.mockResolvedValueOnce({
      ...watchparty,
      isCreator: () => false,
      isLeader: () => false,
    });
    await expect(
      updateUseCase.execute("u2", "w1", {} as never)
    ).rejects.toBeInstanceOf(UnauthorizedError);

    repository.findById.mockResolvedValueOnce(watchparty);
    repository.update.mockResolvedValueOnce(watchparty);
    await expect(updateUseCase.execute("u1", "w1", {} as never)).resolves.toBe(
      watchparty
    );
  });
});
