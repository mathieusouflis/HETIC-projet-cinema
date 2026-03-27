// @ts-nocheck
import { describe, expect, it, vi } from "vitest";
import { ConflictError } from "../../../../shared/errors/conflict-error.js";
import { NotFoundError } from "../../../../shared/errors/not-found-error.js";
import { ServerError } from "../../../../shared/errors/server-error.js";
import { UnauthorizedError } from "../../../../shared/errors/unauthorized-error.js";
import { AddWatchlistContentUseCase } from "./add-watchlist-content.use-case";
import { DeleteWatchlistByIdUseCase } from "./delete-watchlist.use-case";
import { DeleteWatchlistByContentIdUseCase } from "./delete-watchlist-by-content.use-case";
import { GetWatchlistByIdUseCase } from "./get-watchlist.use-case";
import { GetWatchlistByContentIdUseCase } from "./get-watchlist-content.use-case";
import { ListWatchlistUseCase } from "./list-watchlist.use-case";
import { PatchWatchlistByIdUseCase } from "./patch-watchlist.use-case";
import { PutWatchlistByContentIdUseCase } from "./put-watchlist-by-content.use-case";

const item = { id: "w1", userId: "u1", toJSON: () => ({ id: "w1" }) };

describe("watchlist use-cases", () => {
  it("covers add use case error mappings", async () => {
    const watchlistRepository = { create: vi.fn() };
    const contentRepository = { getContentById: vi.fn() };
    const useCase = new AddWatchlistContentUseCase(
      watchlistRepository as never,
      contentRepository as never
    );
    const body = { contentId: "c1" };

    contentRepository.getContentById.mockResolvedValueOnce(undefined);
    await expect(useCase.execute("u1", body as never)).rejects.toBeInstanceOf(
      NotFoundError
    );

    contentRepository.getContentById.mockResolvedValue({ id: "c1" });
    watchlistRepository.create.mockRejectedValueOnce(
      new Error("already exists")
    );
    await expect(useCase.execute("u1", body as never)).rejects.toBeInstanceOf(
      ConflictError
    );

    watchlistRepository.create.mockRejectedValueOnce(new Error("oops"));
    await expect(useCase.execute("u1", body as never)).rejects.toBeInstanceOf(
      ServerError
    );

    watchlistRepository.create.mockResolvedValueOnce(item);
    await expect(useCase.execute("u1", body as never)).resolves.toBe(item);
  });

  it("covers get/delete by id and content id", async () => {
    const repo = {
      findById: vi.fn(),
      findByContentId: vi.fn(),
      delete: vi.fn(),
    };
    const getById = new GetWatchlistByIdUseCase(repo as never);
    const getByContent = new GetWatchlistByContentIdUseCase(repo as never);
    const delById = new DeleteWatchlistByIdUseCase(repo as never);
    const delByContent = new DeleteWatchlistByContentIdUseCase(repo as never);

    repo.findById.mockResolvedValueOnce(null);
    await expect(getById.execute("u1", "w1")).rejects.toBeInstanceOf(
      NotFoundError
    );
    repo.findById.mockResolvedValueOnce({ ...item, userId: "u2" });
    await expect(getById.execute("u1", "w1")).rejects.toBeInstanceOf(
      UnauthorizedError
    );
    repo.findById.mockResolvedValueOnce(item);
    await expect(getById.execute("u1", "w1")).resolves.toBe(item);

    repo.findByContentId.mockResolvedValueOnce(null);
    await expect(getByContent.execute("u1", "c1")).rejects.toBeInstanceOf(
      NotFoundError
    );
    repo.findByContentId.mockResolvedValueOnce(item);
    await expect(getByContent.execute("u1", "c1")).resolves.toBe(item);

    repo.findById.mockResolvedValueOnce(item);
    await delById.execute("u1", "w1");
    repo.findByContentId.mockResolvedValueOnce(item);
    await delByContent.execute("u1", "c1");
  });

  it("covers delete unauthorized and missing branches", async () => {
    const repo = {
      findById: vi.fn(),
      findByContentId: vi.fn(),
      delete: vi.fn(),
    };
    const delById = new DeleteWatchlistByIdUseCase(repo as never);
    const delByContent = new DeleteWatchlistByContentIdUseCase(repo as never);

    repo.findById.mockResolvedValueOnce({ ...item, userId: "u2" });
    await expect(delById.execute("u1", "w1")).rejects.toBeInstanceOf(
      UnauthorizedError
    );
    repo.findById.mockResolvedValueOnce(null);
    await expect(delById.execute("u1", "w1")).rejects.toBeInstanceOf(
      NotFoundError
    );

    repo.findByContentId.mockResolvedValueOnce({ ...item, userId: "u2" });
    await expect(delByContent.execute("u1", "c1")).rejects.toBeInstanceOf(
      UnauthorizedError
    );
    repo.findByContentId.mockResolvedValueOnce(null);
    await expect(delByContent.execute("u1", "c1")).rejects.toBeInstanceOf(
      NotFoundError
    );
  });

  it("covers list/patch/put flows", async () => {
    const repo = {
      list: vi.fn().mockResolvedValue({ data: [item], total: 1 }),
      findById: vi.fn(),
      update: vi.fn(),
      findByContentId: vi.fn(),
      create: vi.fn(),
    };
    const ratingRepo = { delete: vi.fn(), upsert: vi.fn() };
    const listUseCase = new ListWatchlistUseCase(repo as never);
    const patchUseCase = new PatchWatchlistByIdUseCase(repo as never);
    const putUseCase = new PutWatchlistByContentIdUseCase(
      repo as never,
      ratingRepo as never
    );

    const list = await listUseCase.execute("u1", {
      page: 1,
      limit: 10,
    } as never);
    expect(list.data.items).toHaveLength(1);

    repo.findById.mockResolvedValueOnce(null);
    await expect(
      patchUseCase.execute("u1", "w1", {} as never)
    ).rejects.toBeInstanceOf(NotFoundError);
    repo.findById.mockResolvedValueOnce({ ...item, userId: "u2" });
    await expect(
      patchUseCase.execute("u1", "w1", {} as never)
    ).rejects.toBeInstanceOf(UnauthorizedError);
    repo.findById.mockResolvedValueOnce(item);
    repo.update.mockResolvedValueOnce(item);
    await expect(patchUseCase.execute("u1", "w1", {} as never)).resolves.toBe(
      item
    );

    repo.findByContentId.mockResolvedValueOnce(null);
    repo.create.mockResolvedValueOnce(item);
    repo.findByContentId.mockResolvedValueOnce(item);
    await expect(
      putUseCase.execute("u1", "c1", { rating: null } as never)
    ).resolves.toBe(item);
    expect(ratingRepo.delete).toHaveBeenCalled();

    repo.findByContentId.mockResolvedValueOnce(item);
    repo.update.mockResolvedValueOnce(item);
    repo.findByContentId.mockResolvedValueOnce(item);
    await expect(
      putUseCase.execute("u1", "c1", { rating: 8 } as never)
    ).resolves.toBe(item);
    expect(ratingRepo.upsert).toHaveBeenCalled();
  });
});
